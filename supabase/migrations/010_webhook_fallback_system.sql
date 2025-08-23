-- Webhook Fallback System for Optimal Twilio Integration
-- Provides intelligent fallback, retry logic, and monitoring

-- =======================================================================
-- 1. WEBHOOK FALLBACK QUEUE TABLE
-- =======================================================================

CREATE TABLE IF NOT EXISTS webhook_fallback_queue (
    id BIGSERIAL PRIMARY KEY,
    twilio_sid VARCHAR(100) NOT NULL,
    webhook_data JSONB NOT NULL,
    processing_status VARCHAR(20) NOT NULL DEFAULT 'pending_review' 
        CHECK (processing_status IN ('pending_review', 'processing', 'completed', 'failed', 'abandoned')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5), -- 1=highest, 5=lowest
    requires_manual_review BOOLEAN DEFAULT true,
    assigned_to VARCHAR(255), -- For manual review assignment
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fallback queue
CREATE INDEX IF NOT EXISTS idx_webhook_fallback_status ON webhook_fallback_queue(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_fallback_priority ON webhook_fallback_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_fallback_twilio_sid ON webhook_fallback_queue(twilio_sid);
CREATE INDEX IF NOT EXISTS idx_webhook_fallback_retry ON webhook_fallback_queue(retry_count, last_retry_at);

-- =======================================================================
-- 2. WEBHOOK CRITICAL FAILURES TABLE
-- =======================================================================

CREATE TABLE IF NOT EXISTS webhook_critical_failures (
    id BIGSERIAL PRIMARY KEY,
    twilio_sid VARCHAR(100) NOT NULL,
    webhook_data JSONB NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    failure_type VARCHAR(50) DEFAULT 'processing_error'
        CHECK (failure_type IN ('processing_error', 'validation_error', 'security_error', 'system_error')),
    requires_manual_intervention BOOLEAN DEFAULT true,
    intervention_notes TEXT,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for critical failures
CREATE INDEX IF NOT EXISTS idx_webhook_critical_failures_type ON webhook_critical_failures(failure_type);
CREATE INDEX IF NOT EXISTS idx_webhook_critical_failures_resolved ON webhook_critical_failures(requires_manual_intervention, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_critical_failures_twilio_sid ON webhook_critical_failures(twilio_sid);

-- =======================================================================
-- 3. WEBHOOK PROCESSING METRICS TABLE
-- =======================================================================

CREATE TABLE IF NOT EXISTS webhook_processing_metrics (
    id BIGSERIAL PRIMARY KEY,
    twilio_sid VARCHAR(100),
    processing_strategy VARCHAR(20) NOT NULL
        CHECK (processing_strategy IN ('graphql_full', 'direct_fast', 'fallback_simple')),
    operation_type VARCHAR(20) NOT NULL
        CHECK (operation_type IN ('message_received', 'status_update', 'unknown')),
    processing_time_ms INTEGER,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    retry_attempt INTEGER DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for metrics
CREATE INDEX IF NOT EXISTS idx_webhook_metrics_strategy ON webhook_processing_metrics(processing_strategy, processed_at);
CREATE INDEX IF NOT EXISTS idx_webhook_metrics_success ON webhook_processing_metrics(success, processed_at);
CREATE INDEX IF NOT EXISTS idx_webhook_metrics_operation ON webhook_processing_metrics(operation_type, processed_at);

-- =======================================================================
-- 4. WEBHOOK HEALTH MONITORING VIEW
-- =======================================================================

CREATE OR REPLACE VIEW webhook_health_summary AS
SELECT 
    DATE(processed_at) as date,
    processing_strategy,
    operation_type,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE success = true) as successful_requests,
    COUNT(*) FILTER (WHERE success = false) as failed_requests,
    ROUND(
        COUNT(*) FILTER (WHERE success = true)::decimal / 
        NULLIF(COUNT(*)::decimal, 0) * 100, 2
    ) as success_rate,
    AVG(processing_time_ms) as avg_processing_time_ms,
    MAX(processing_time_ms) as max_processing_time_ms
FROM webhook_processing_metrics
WHERE processed_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(processed_at), processing_strategy, operation_type
ORDER BY date DESC, processing_strategy;

-- =======================================================================
-- 5. FALLBACK QUEUE MANAGEMENT FUNCTIONS
-- =======================================================================

-- Function to get next item from fallback queue
CREATE OR REPLACE FUNCTION get_next_fallback_item(
    assigned_user VARCHAR(255) DEFAULT NULL
) RETURNS TABLE (
    id BIGINT,
    twilio_sid VARCHAR(100),
    webhook_data JSONB,
    retry_count INTEGER,
    priority INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Get highest priority item that's ready for retry
    RETURN QUERY
    UPDATE webhook_fallback_queue
    SET 
        processing_status = 'processing',
        assigned_to = assigned_user,
        updated_at = NOW()
    WHERE webhook_fallback_queue.id = (
        SELECT webhook_fallback_queue.id 
        FROM webhook_fallback_queue
        WHERE processing_status = 'pending_review'
          AND (last_retry_at IS NULL OR last_retry_at < NOW() - INTERVAL '30 minutes')
          AND retry_count < max_retries
        ORDER BY priority ASC, created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING 
        webhook_fallback_queue.id,
        webhook_fallback_queue.twilio_sid,
        webhook_fallback_queue.webhook_data,
        webhook_fallback_queue.retry_count,
        webhook_fallback_queue.priority,
        webhook_fallback_queue.created_at;
END;
$$ LANGUAGE plpgsql;

-- Function to mark fallback item as completed
CREATE OR REPLACE FUNCTION complete_fallback_item(
    item_id BIGINT,
    success BOOLEAN,
    error_msg TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    UPDATE webhook_fallback_queue
    SET 
        processing_status = CASE WHEN success THEN 'completed' ELSE 'failed' END,
        error_message = error_msg,
        resolved_at = CASE WHEN success THEN NOW() ELSE NULL END,
        retry_count = retry_count + 1,
        last_retry_at = NOW(),
        updated_at = NOW()
    WHERE id = item_id;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- =======================================================================
-- 6. WEBHOOK HEALTH CHECK FUNCTION
-- =======================================================================

CREATE OR REPLACE FUNCTION webhook_system_health_check()
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    status TEXT,
    threshold NUMERIC,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    recent_failures INTEGER;
    critical_failures INTEGER;
    avg_processing_time NUMERIC;
    fallback_queue_size INTEGER;
BEGIN
    -- Check recent failures (last hour)
    SELECT COUNT(*) INTO recent_failures
    FROM webhook_processing_metrics
    WHERE processed_at >= NOW() - INTERVAL '1 hour'
      AND success = false;
    
    -- Check critical failures (last hour)
    SELECT COUNT(*) INTO critical_failures
    FROM webhook_critical_failures
    WHERE created_at >= NOW() - INTERVAL '1 hour';
    
    -- Check average processing time (last hour)
    SELECT COALESCE(AVG(processing_time_ms), 0) INTO avg_processing_time
    FROM webhook_processing_metrics
    WHERE processed_at >= NOW() - INTERVAL '1 hour'
      AND success = true;
    
    -- Check fallback queue size
    SELECT COUNT(*) INTO fallback_queue_size
    FROM webhook_fallback_queue
    WHERE processing_status = 'pending_review';
    
    -- Return metrics
    RETURN QUERY VALUES
        ('recent_failures', recent_failures, 
         CASE WHEN recent_failures > 10 THEN 'critical'
              WHEN recent_failures > 5 THEN 'warning'
              ELSE 'healthy' END,
         5.0, NOW()),
        ('critical_failures', critical_failures,
         CASE WHEN critical_failures > 0 THEN 'critical' ELSE 'healthy' END,
         0.0, NOW()),
        ('avg_processing_time_ms', avg_processing_time,
         CASE WHEN avg_processing_time > 5000 THEN 'warning'
              WHEN avg_processing_time > 10000 THEN 'critical'
              ELSE 'healthy' END,
         5000.0, NOW()),
        ('fallback_queue_size', fallback_queue_size,
         CASE WHEN fallback_queue_size > 50 THEN 'critical'
              WHEN fallback_queue_size > 20 THEN 'warning'
              ELSE 'healthy' END,
         20.0, NOW());
END;
$$ LANGUAGE plpgsql;

-- =======================================================================
-- 7. TRIGGER FOR AUTO-UPDATING TIMESTAMPS
-- =======================================================================

CREATE OR REPLACE FUNCTION update_webhook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS trigger_webhook_fallback_updated_at ON webhook_fallback_queue;
CREATE TRIGGER trigger_webhook_fallback_updated_at
    BEFORE UPDATE ON webhook_fallback_queue
    FOR EACH ROW EXECUTE FUNCTION update_webhook_updated_at();

-- =======================================================================
-- 8. ROW LEVEL SECURITY
-- =======================================================================

-- Enable RLS
ALTER TABLE webhook_fallback_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_critical_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_processing_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (admin dashboard access)
CREATE POLICY "Admin access to webhook fallback queue" ON webhook_fallback_queue
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin access to webhook critical failures" ON webhook_critical_failures
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin access to webhook metrics" ON webhook_processing_metrics
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- =======================================================================
-- 9. COMMENTS AND DOCUMENTATION
-- =======================================================================

COMMENT ON TABLE webhook_fallback_queue IS 'Queue for webhook processing failures with retry logic';
COMMENT ON TABLE webhook_critical_failures IS 'Critical webhook failures requiring manual intervention';
COMMENT ON TABLE webhook_processing_metrics IS 'Performance metrics for webhook processing';
COMMENT ON VIEW webhook_health_summary IS 'Daily webhook processing health summary';
COMMENT ON FUNCTION get_next_fallback_item(VARCHAR) IS 'Get next item from fallback queue for processing';
COMMENT ON FUNCTION complete_fallback_item(BIGINT, BOOLEAN, TEXT) IS 'Mark fallback queue item as completed or failed';
COMMENT ON FUNCTION webhook_system_health_check() IS 'Comprehensive webhook system health check';