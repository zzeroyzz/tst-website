-- Remove Questionnaire System Migration
-- Removes all questionnaire-related columns and functionality

-- =======================================================================
-- 1. DROP VIEWS THAT DEPEND ON QUESTIONNAIRE COLUMNS
-- =======================================================================

-- Drop existing view first to avoid dependency issues
DROP VIEW IF EXISTS crm_contact_summary;

-- =======================================================================
-- 2. DROP QUESTIONNAIRE COLUMNS FROM CONTACTS TABLE
-- =======================================================================

-- Remove questionnaire-related columns from contacts table
ALTER TABLE contacts 
DROP COLUMN IF EXISTS questionnaire_token,
DROP COLUMN IF EXISTS questionnaire_completed,
DROP COLUMN IF EXISTS questionnaire_completed_at;

-- =======================================================================
-- 3. RECREATE CONTACT VIEWS WITHOUT QUESTIONNAIRE REFERENCES
-- =======================================================================

-- Recreate contact summary view without questionnaire fields
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
-- 3. REMOVE QUESTIONNAIRE SEGMENTS
-- =======================================================================

-- Remove questionnaire-related segments from the default segments
DELETE FROM crm_contact_segments 
WHERE name IN ('Questionnaire Incomplete', 'Questionnaire Complete');

-- =======================================================================
-- 4. UPDATE MESSAGE TEMPLATES TO REMOVE QUESTIONNAIRE REFERENCES
-- =======================================================================

-- Remove questionnaire-related message templates
DELETE FROM crm_message_templates 
WHERE category = 'QUESTIONNAIRE' OR name ILIKE '%questionnaire%';

-- =======================================================================
-- 5. CLEAN UP WORKFLOW TRIGGERS
-- =======================================================================

-- Remove questionnaire-related workflow triggers
DELETE FROM crm_workflows 
WHERE trigger_type = 'QUESTIONNAIRE_COMPLETED';

-- Update workflow trigger enum (this will need to be done manually if needed)
-- ALTER TYPE workflow_trigger_enum DROP VALUE 'QUESTIONNAIRE_COMPLETED';

-- =======================================================================
-- 6. UPDATE COMMENTS AND DOCUMENTATION
-- =======================================================================

COMMENT ON VIEW crm_contact_summary IS 'Contact summary view without questionnaire functionality';

-- Create migrations log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public._migrations_log (
    id BIGSERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log the migration
INSERT INTO public._migrations_log (migration_name, executed_at) 
VALUES ('011_remove_questionnaire_system', NOW())
ON CONFLICT DO NOTHING;