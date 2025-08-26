-- Webhook Processing Enhancement Tables
-- Tables to support the enhanced webhook processing system

-- Table for processing metrics and monitoring
CREATE TABLE IF NOT EXISTS webhook_processing_metrics (
    id BIGSERIAL PRIMARY KEY,
    twilio_sid VARCHAR(100) NOT NULL,
    processing_strategy VARCHAR(50) NOT NULL 
        CHECK (processing_strategy IN ('graphql_full', 'direct_fast', 'fallback_simple')),
    operation_type VARCHAR(50) NOT NULL 
        CHECK (operation_type IN ('message_received', 'status_update', 'unknown')),
    processing_time_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    retry_attempt INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for metrics
CREATE INDEX IF NOT EXISTS idx_webhook_metrics_twilio_sid ON webhook_processing_metrics(twilio_sid);
CREATE INDEX IF NOT EXISTS idx_webhook_metrics_strategy ON webhook_processing_metrics(processing_strategy);
CREATE INDEX IF NOT EXISTS idx_webhook_metrics_created_at ON webhook_processing_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_metrics_success ON webhook_processing_metrics(success);

-- Table for critical webhook failures requiring manual intervention
CREATE TABLE IF NOT EXISTS webhook_critical_failures (
    id BIGSERIAL PRIMARY KEY,
    twilio_sid VARCHAR(100) NOT NULL,
    webhook_data JSONB NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    failure_type VARCHAR(50) NOT NULL DEFAULT 'processing_error'
        CHECK (failure_type IN ('processing_error', 'security_error', 'validation_error')),
    requires_manual_intervention BOOLEAN DEFAULT true,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for critical failures
CREATE INDEX IF NOT EXISTS idx_webhook_failures_twilio_sid ON webhook_critical_failures(twilio_sid);
CREATE INDEX IF NOT EXISTS idx_webhook_failures_resolved ON webhook_critical_failures(resolved);
CREATE INDEX IF NOT EXISTS idx_webhook_failures_created_at ON webhook_critical_failures(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_failures_type ON webhook_critical_failures(failure_type);

-- Function for webhook system health check
CREATE OR REPLACE FUNCTION webhook_system_health_check()
RETURNS TABLE (
    metric_name TEXT,
    status TEXT,
    value NUMERIC,
    threshold NUMERIC,
    description TEXT
) AS $$
BEGIN
    -- Check recent failure rate (last hour)
    RETURN QUERY
    WITH recent_metrics AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE success = false) as failures
        FROM webhook_processing_metrics 
        WHERE created_at > NOW() - INTERVAL '1 hour'
    )
    SELECT 
        'recent_failure_rate'::TEXT,
        CASE 
            WHEN rm.total = 0 THEN 'unknown'
            WHEN (rm.failures::NUMERIC / rm.total) > 0.1 THEN 'critical'
            WHEN (rm.failures::NUMERIC / rm.total) > 0.05 THEN 'warning'
            ELSE 'healthy'
        END,
        COALESCE(rm.failures::NUMERIC / NULLIF(rm.total, 0), 0),
        0.1::NUMERIC,
        'Percentage of failed webhook processing attempts in the last hour'::TEXT
    FROM recent_metrics rm;

    -- Check average processing time
    RETURN QUERY
    WITH recent_performance AS (
        SELECT AVG(processing_time_ms) as avg_time
        FROM webhook_processing_metrics 
        WHERE created_at > NOW() - INTERVAL '1 hour'
        AND success = true
    )
    SELECT 
        'average_processing_time'::TEXT,
        CASE 
            WHEN rp.avg_time > 5000 THEN 'critical'
            WHEN rp.avg_time > 2000 THEN 'warning'
            ELSE 'healthy'
        END,
        COALESCE(rp.avg_time, 0),
        2000::NUMERIC,
        'Average processing time in milliseconds for successful webhooks'::TEXT
    FROM recent_performance rp;

    -- Check unresolved critical failures
    RETURN QUERY
    WITH critical_failures AS (
        SELECT COUNT(*) as count
        FROM webhook_critical_failures 
        WHERE resolved = false
    )
    SELECT 
        'unresolved_critical_failures'::TEXT,
        CASE 
            WHEN cf.count > 5 THEN 'critical'
            WHEN cf.count > 0 THEN 'warning'
            ELSE 'healthy'
        END,
        cf.count::NUMERIC,
        0::NUMERIC,
        'Number of unresolved critical webhook failures'::TEXT
    FROM critical_failures cf;

    -- Check fallback queue size
    RETURN QUERY
    WITH fallback_queue AS (
        SELECT COUNT(*) as count
        FROM webhook_fallback_queue 
        WHERE processing_status = 'pending_review'
    )
    SELECT 
        'pending_fallback_items'::TEXT,
        CASE 
            WHEN fq.count > 50 THEN 'critical'
            WHEN fq.count > 20 THEN 'warning'
            ELSE 'healthy'
        END,
        fq.count::NUMERIC,
        20::NUMERIC,
        'Number of items in fallback queue awaiting review'::TEXT
    FROM fallback_queue fq;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT ON webhook_processing_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON webhook_critical_failures TO authenticated;
GRANT EXECUTE ON FUNCTION webhook_system_health_check() TO authenticated;

-- Grant service role full access for webhook processing
GRANT ALL ON webhook_processing_metrics TO service_role;
GRANT ALL ON webhook_critical_failures TO service_role;
GRANT ALL ON FUNCTION webhook_system_health_check() TO service_role;

-- Add RLS policies
ALTER TABLE webhook_processing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_critical_failures ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view metrics and failures
CREATE POLICY "Allow authenticated users to view webhook metrics" ON webhook_processing_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view critical failures" ON webhook_critical_failures
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role full access for webhook operations
CREATE POLICY "Service role full access to webhook metrics" ON webhook_processing_metrics
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to critical failures" ON webhook_critical_failures
    FOR ALL USING (auth.role() = 'service_role');