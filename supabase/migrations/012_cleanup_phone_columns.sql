-- Cleanup Phone Columns Migration
-- Removes duplicate phone column and questionnaire_reminder_sent_at column

-- =======================================================================
-- 1. DROP UNUSED COLUMNS FROM CONTACTS TABLE
-- =======================================================================

-- Remove questionnaire_reminder_sent_at column if it exists
ALTER TABLE contacts DROP COLUMN IF EXISTS questionnaire_reminder_sent_at;

-- Remove duplicate phone column (keeping phone_number)
ALTER TABLE contacts DROP COLUMN IF EXISTS phone;

-- =======================================================================
-- 2. UPDATE VIEWS TO REMOVE REFERENCES TO DROPPED COLUMNS
-- =======================================================================

-- Update contact summary view to ensure it doesn't reference dropped columns
CREATE OR REPLACE VIEW crm_contact_summary AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone_number,
    c.contact_status,
    c.segments,
    c.created_at,
    c.last_message_at,
    c.message_count,
    c.scheduled_appointment_at,
    c.appointment_status,
    -- Count messages by direction
    COALESCE(msg_stats.sent_count, 0) as messages_sent,
    COALESCE(msg_stats.received_count, 0) as messages_received,
    -- Last message content preview
    COALESCE(last_msg.content, '') as last_message_preview,
    last_msg.direction as last_message_direction,
    last_msg.created_at as last_message_time
FROM contacts c
LEFT JOIN (
    SELECT 
        contact_id,
        SUM(CASE WHEN direction = 'OUTBOUND' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN direction = 'INBOUND' THEN 1 ELSE 0 END) as received_count
    FROM crm_messages 
    GROUP BY contact_id
) msg_stats ON c.id = msg_stats.contact_id
LEFT JOIN (
    SELECT DISTINCT ON (contact_id)
        contact_id,
        content,
        direction,
        created_at
    FROM crm_messages
    ORDER BY contact_id, created_at DESC
) last_msg ON c.id = last_msg.contact_id;

-- =======================================================================
-- 3. LOG THE MIGRATION
-- =======================================================================

-- Create migrations log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public._migrations_log (
    id BIGSERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log the migration
INSERT INTO public._migrations_log (migration_name, executed_at) 
VALUES ('012_cleanup_phone_columns', NOW())
ON CONFLICT DO NOTHING;

COMMENT ON TABLE contacts IS 'Contacts table with cleaned up phone column structure';