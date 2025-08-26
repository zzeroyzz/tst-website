-- Fallback Queue Management Functions
-- Functions to manage the webhook fallback queue processing

-- Function to get next items from fallback queue for processing
CREATE OR REPLACE FUNCTION get_next_fallback_item(assigned_user TEXT DEFAULT 'system')
RETURNS TABLE (
    id BIGINT,
    twilio_sid TEXT,
    webhook_data JSONB,
    processing_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wfq.id,
        wfq.twilio_sid,
        wfq.webhook_data,
        wfq.processing_status,
        wfq.created_at
    FROM webhook_fallback_queue wfq
    WHERE wfq.processing_status = 'pending_review'
    ORDER BY wfq.created_at ASC
    LIMIT 10; -- Process in batches
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete/update fallback item processing
CREATE OR REPLACE FUNCTION complete_fallback_item(
    item_id BIGINT,
    success BOOLEAN,
    error_msg TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE webhook_fallback_queue
    SET 
        processing_status = CASE 
            WHEN success THEN 'completed'
            ELSE 'failed'
        END,
        error_message = error_msg,
        updated_at = NOW()
    WHERE id = item_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create table for workflow processing logs if it doesn't exist
CREATE TABLE IF NOT EXISTS workflow_processing_logs (
    id BIGSERIAL PRIMARY KEY,
    total_processed INTEGER NOT NULL,
    breakdown JSONB DEFAULT '{}',
    errors TEXT[] DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_next_fallback_item(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION complete_fallback_item(BIGINT, BOOLEAN, TEXT) TO service_role;
GRANT ALL ON workflow_processing_logs TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fallback_queue_status ON webhook_fallback_queue(processing_status, created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_processed_at ON workflow_processing_logs(processed_at);