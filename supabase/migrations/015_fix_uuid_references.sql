-- Fix remaining UUID references after migration issues
-- This migration ensures all views use user_id instead of non-existent uuid column

-- Drop and recreate the contact summary view to remove uuid references
DROP VIEW IF EXISTS crm_contact_summary;

CREATE OR REPLACE VIEW crm_contact_summary AS
SELECT 
    c.id,
    c.user_id,
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

-- Also fix the upcoming appointments view if it has similar issues
DROP VIEW IF EXISTS upcoming_appointments;

CREATE OR REPLACE VIEW upcoming_appointments AS
SELECT 
    a.id,
    a.contact_id,
    a.scheduled_at,
    a.status,
    a.time_zone,
    a.notes,
    a.created_at,
    c.name as contact_name,
    c.user_id as contact_user_id,
    c.email as contact_email,
    c.phone_number as contact_phone
FROM appointments a
JOIN contacts c ON a.contact_id = c.id
WHERE a.scheduled_at > NOW()
    AND a.status IN ('SCHEDULED', 'PENDING')
ORDER BY a.scheduled_at ASC;

-- Log the migration
INSERT INTO public._migrations_log (migration_name, executed_at) 
VALUES ('015_fix_uuid_references', NOW())
ON CONFLICT (migration_name) DO NOTHING;

COMMENT ON VIEW crm_contact_summary IS 'Contact summary view using user_id instead of uuid';
COMMENT ON VIEW upcoming_appointments IS 'Upcoming appointments view using contact user_id';