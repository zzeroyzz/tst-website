-- Add user_id UUID column to contacts table for cancel link functionality
-- Remove any references to non-existent uuid column

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add user_id column with UUID default
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Backfill any null user_id values with fresh UUIDs
UPDATE public.contacts
SET user_id = gen_random_uuid()
WHERE user_id IS NULL;

-- Set constraints on user_id column
ALTER TABLE public.contacts
  ALTER COLUMN user_id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN user_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON public.contacts(user_id);

-- Add unique constraint (using DO block to handle potential conflicts)
DO $$ 
BEGIN
  ALTER TABLE public.contacts ADD CONSTRAINT contacts_user_id_unique UNIQUE (user_id);
EXCEPTION 
  WHEN duplicate_table THEN NULL;
  WHEN others THEN NULL;
END $$;

-- Update contact summary view to include user_id
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

-- Log the migration
CREATE TABLE IF NOT EXISTS public._migrations_log (
    id BIGSERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public._migrations_log (migration_name, executed_at) 
VALUES ('014_add_user_id_to_contacts', NOW())
ON CONFLICT (migration_name) DO NOTHING;

COMMENT ON COLUMN contacts.user_id IS 'Public UUID for cancel links and external references';