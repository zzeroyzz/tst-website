-- Message Delivery Tracking Tables and Functions
-- Support for delivery status tracking, analytics, and reporting

-- Table for tracking delivery events
CREATE TABLE IF NOT EXISTS message_delivery_events (
    id BIGSERIAL PRIMARY KEY,
    message_sid VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    processing_time_ms INTEGER,
    error_code VARCHAR(50),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for delivery events
CREATE INDEX IF NOT EXISTS idx_delivery_events_message_sid ON message_delivery_events(message_sid);
CREATE INDEX IF NOT EXISTS idx_delivery_events_status ON message_delivery_events(status);
CREATE INDEX IF NOT EXISTS idx_delivery_events_created_at ON message_delivery_events(created_at);

-- Function to get message status counts for analytics
CREATE OR REPLACE FUNCTION get_message_status_counts(
    start_date TIMESTAMP WITH TIME ZONE,
    message_direction TEXT DEFAULT 'OUTBOUND'
)
RETURNS TABLE (
    status TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        crm_messages.message_status::TEXT,
        COUNT(*) as count
    FROM crm_messages 
    WHERE crm_messages.created_at >= start_date
    AND crm_messages.direction = message_direction
    GROUP BY crm_messages.message_status
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get delivery failure analysis
CREATE OR REPLACE FUNCTION analyze_delivery_failures(
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    failure_category TEXT,
    count BIGINT,
    percentage NUMERIC,
    sample_errors TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH failure_data AS (
        SELECT 
            CASE 
                WHEN error_message ILIKE '%invalid%' OR error_message ILIKE '%not a valid%' THEN 'Invalid Phone Number'
                WHEN error_message ILIKE '%blocked%' OR error_message ILIKE '%opt out%' OR error_message ILIKE '%stop%' THEN 'Recipient Opted Out'
                WHEN error_message ILIKE '%carrier violation%' OR error_message ILIKE '%spam%' THEN 'Carrier Violation'
                WHEN error_message ILIKE '%queue overflow%' OR error_message ILIKE '%rate limit%' THEN 'Rate Limiting'
                WHEN error_message ILIKE '%unreachable%' THEN 'Unreachable Destination'
                ELSE 'Other Error'
            END as category,
            error_message
        FROM crm_messages 
        WHERE created_at > NOW() - INTERVAL '%s days' AND message_status IN ('FAILED', 'UNDELIVERED')
        AND error_message IS NOT NULL
    ),
    category_counts AS (
        SELECT 
            category,
            COUNT(*) as cat_count,
            array_agg(DISTINCT error_message ORDER BY error_message) as errors
        FROM failure_data 
        GROUP BY category
    ),
    total_failures AS (
        SELECT SUM(cat_count) as total FROM category_counts
    )
    SELECT 
        cc.category::TEXT,
        cc.cat_count::BIGINT,
        ROUND((cc.cat_count::NUMERIC / tf.total * 100), 2) as percentage,
        cc.errors[1:3] as sample_errors -- First 3 unique errors
    FROM category_counts cc
    CROSS JOIN total_failures tf
    ORDER BY cc.cat_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get delivery performance metrics
CREATE OR REPLACE FUNCTION get_delivery_performance(
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    unit TEXT,
    trend TEXT
) AS $$
BEGIN
    -- Current period metrics
    WITH current_period AS (
        SELECT 
            COUNT(*) FILTER (WHERE message_status = 'DELIVERED') as delivered,
            COUNT(*) FILTER (WHERE message_status IN ('FAILED', 'UNDELIVERED')) as failed,
            COUNT(*) as total
        FROM crm_messages 
        WHERE direction = 'OUTBOUND'
        AND created_at > NOW() - INTERVAL '%s days'
    ),
    -- Previous period for trend comparison
    previous_period AS (
        SELECT 
            COUNT(*) FILTER (WHERE message_status = 'DELIVERED') as delivered,
            COUNT(*) FILTER (WHERE message_status IN ('FAILED', 'UNDELIVERED')) as failed,
            COUNT(*) as total
        FROM crm_messages 
        WHERE direction = 'OUTBOUND'
        AND created_at BETWEEN NOW() - INTERVAL '%s days' * 2 AND NOW() - INTERVAL '%s days'
    ),
    -- Average delivery time
    delivery_times AS (
        SELECT AVG(processing_time_ms) as avg_delivery_time
        FROM message_delivery_events
        WHERE status = 'delivered'
        AND created_at > NOW() - INTERVAL '%s days'
    )
    -- Return metrics
    SELECT 'Delivery Rate'::TEXT, 
           CASE WHEN cp.total > 0 THEN ROUND((cp.delivered::NUMERIC / cp.total * 100), 2) ELSE 0 END,
           'percentage'::TEXT,
           CASE 
               WHEN pp.total > 0 AND cp.total > 0 THEN
                   CASE WHEN (cp.delivered::NUMERIC / cp.total) > (pp.delivered::NUMERIC / pp.total) THEN 'up' ELSE 'down' END
               ELSE 'stable'
           END
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 'Failure Rate'::TEXT,
           CASE WHEN cp.total > 0 THEN ROUND((cp.failed::NUMERIC / cp.total * 100), 2) ELSE 0 END,
           'percentage'::TEXT,
           CASE 
               WHEN pp.total > 0 AND cp.total > 0 THEN
                   CASE WHEN (cp.failed::NUMERIC / cp.total) < (pp.failed::NUMERIC / pp.total) THEN 'up' ELSE 'down' END
               ELSE 'stable'
           END
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 'Average Delivery Time'::TEXT,
           COALESCE(dt.avg_delivery_time / 1000, 0), -- Convert to seconds
           'seconds'::TEXT,
           'stable'::TEXT -- Would need more complex logic to determine trend
    FROM delivery_times dt;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update message statuses (for cron jobs)
CREATE OR REPLACE FUNCTION update_pending_message_statuses()
RETURNS TABLE (
    updated_count INTEGER,
    error_count INTEGER
) AS $$
DECLARE
    pending_messages RECORD;
    update_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Get pending messages from last 24 hours
    FOR pending_messages IN 
        SELECT twilio_sid, id
        FROM crm_messages 
        WHERE direction = 'OUTBOUND'
        AND message_status IN ('QUEUED', 'SENDING', 'SENT')
        AND created_at > NOW() - INTERVAL '24 hours'
        AND twilio_sid IS NOT NULL
    LOOP
        BEGIN
            -- Note: In a real implementation, you'd call Twilio API here
            -- For now, we'll just log that we should check this message
            INSERT INTO message_delivery_events (message_sid, status, metadata)
            VALUES (
                pending_messages.twilio_sid, 
                'status_check_needed',
                jsonb_build_object('message_id', pending_messages.id, 'check_time', NOW())
            );
            
            update_count := update_count + 1;
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            -- Log the error but continue processing
            INSERT INTO webhook_critical_failures (
                twilio_sid, 
                webhook_data, 
                error_message,
                failure_type
            ) VALUES (
                pending_messages.twilio_sid,
                jsonb_build_object('message_id', pending_messages.id),
                SQLERRM,
                'status_update_error'
            );
        END;
    END LOOP;
    
    RETURN QUERY SELECT update_count, error_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT ON message_delivery_events TO authenticated;
GRANT SELECT, INSERT ON message_delivery_events TO service_role;

GRANT EXECUTE ON FUNCTION get_message_status_counts(TIMESTAMP WITH TIME ZONE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_delivery_failures(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_delivery_performance(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_pending_message_statuses() TO service_role;

-- RLS Policies
ALTER TABLE message_delivery_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view delivery events" ON message_delivery_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to delivery events" ON message_delivery_events
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_pending_status ON crm_messages(message_status, created_at, twilio_sid) 
    WHERE direction = 'OUTBOUND' AND message_status IN ('QUEUED', 'SENDING', 'SENT');

-- Create a view for delivery analytics dashboard
CREATE OR REPLACE VIEW message_delivery_dashboard AS
SELECT 
    m.id as message_id,
    m.twilio_sid,
    m.content,
    m.message_status,
    m.message_type,
    m.created_at as sent_at,
    m.updated_at as status_updated_at,
    c.name as contact_name,
    c.phone_number,
    c.contact_status,
    m.error_message,
    -- Latest delivery event
    de.status as latest_delivery_status,
    de.processing_time_ms,
    de.created_at as delivery_event_at
FROM crm_messages m
LEFT JOIN contacts c ON m.contact_id = c.id
LEFT JOIN LATERAL (
    SELECT DISTINCT ON (message_sid) 
        message_sid, status, processing_time_ms, created_at
    FROM message_delivery_events 
    WHERE message_sid = m.twilio_sid
    ORDER BY message_sid, created_at DESC
) de ON true
WHERE m.direction = 'OUTBOUND'
ORDER BY m.created_at DESC;

-- Grant view access
GRANT SELECT ON message_delivery_dashboard TO authenticated;