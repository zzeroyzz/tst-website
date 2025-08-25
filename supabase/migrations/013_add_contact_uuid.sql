-- Add UUID field to contacts table for better external identification
-- Keeps existing BIGINT ID for internal references

-- =======================================================================
-- 1. ADD UUID COLUMN TO CONTACTS TABLE
-- =======================================================================

-- Add UUID column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Create index on UUID for fast lookups
CREATE INDEX IF NOT EXISTS idx_contacts_uuid ON contacts(uuid);

-- =======================================================================
-- 2. ADD UUID COLUMN TO APPOINTMENTS TABLE
-- =======================================================================

-- Add UUID column to appointments table  
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid() UNIQUE;

-- Create index on UUID for fast lookups
CREATE INDEX IF NOT EXISTS idx_appointments_uuid ON appointments(uuid);

-- =======================================================================
-- 3. BACKFILL UUIDS FOR EXISTING RECORDS
-- =======================================================================

-- Generate UUIDs for existing contacts that don't have them
UPDATE contacts SET uuid = gen_random_uuid() WHERE uuid IS NULL;

-- Generate UUIDs for existing appointments that don't have them
UPDATE appointments SET uuid = gen_random_uuid() WHERE uuid IS NULL;

-- =======================================================================
-- 4. MAKE UUID COLUMNS NOT NULL
-- =======================================================================

-- Make UUID columns NOT NULL after backfill
ALTER TABLE contacts ALTER COLUMN uuid SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN uuid SET NOT NULL;

-- =======================================================================
-- 5. UPDATE VIEWS TO INCLUDE UUID
-- =======================================================================

-- Update contact summary view to include UUID
CREATE OR REPLACE VIEW crm_contact_summary AS
SELECT 
    c.id,
    c.uuid,
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

-- Update upcoming appointments view to include UUIDs
CREATE OR REPLACE VIEW upcoming_appointments AS
SELECT 
    a.id,
    a.uuid,
    a.contact_id,
    a.scheduled_at,
    a.status,
    a.time_zone,
    a.notes,
    a.created_at,
    c.name as contact_name,
    c.uuid as contact_uuid,
    c.email as contact_email,
    c.phone_number as contact_phone
FROM appointments a
JOIN contacts c ON a.contact_id = c.id
WHERE a.scheduled_at > NOW()
    AND a.status IN ('SCHEDULED', 'PENDING')
ORDER BY a.scheduled_at ASC;

-- =======================================================================
-- 6. LOG THE MIGRATION
-- =======================================================================

-- Create migrations log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public._migrations_log (
    id BIGSERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log the migration
INSERT INTO public._migrations_log (migration_name, executed_at) 
VALUES ('013_add_contact_uuid', NOW())
ON CONFLICT DO NOTHING;

COMMENT ON COLUMN contacts.uuid IS 'External UUID for API access and cancellation tokens';
COMMENT ON COLUMN appointments.uuid IS 'External UUID for appointment identification and cancellation';