-- Add contact_uuid column to crm_messages table for proper UUID-based relationships

-- Add contact_uuid column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='crm_messages' AND column_name='contact_uuid'
    ) THEN
        ALTER TABLE crm_messages ADD COLUMN contact_uuid UUID;
        
        -- Update existing rows to populate contact_uuid from contacts table
        UPDATE crm_messages 
        SET contact_uuid = contacts.uuid 
        FROM contacts 
        WHERE crm_messages.contact_id = contacts.id 
        AND crm_messages.contact_uuid IS NULL;
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_crm_messages_contact_uuid ON crm_messages(contact_uuid);
        
        -- Add foreign key constraint
        ALTER TABLE crm_messages 
        ADD CONSTRAINT fk_crm_messages_contact_uuid 
        FOREIGN KEY (contact_uuid) REFERENCES contacts(uuid) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure conversation_states table exists (it should from migration 019)
-- But let's make sure with a conditional create
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name='conversation_states'
    ) THEN
        CREATE TABLE conversation_states (
            id BIGSERIAL PRIMARY KEY,
            contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
            current_step_id VARCHAR(10) NOT NULL,
            history JSONB DEFAULT '[]',
            variables JSONB DEFAULT '{}',
            awaiting_response BOOLEAN DEFAULT false,
            last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_conversation_states_contact_id ON conversation_states(contact_id);
        CREATE INDEX IF NOT EXISTS idx_conversation_states_current_step ON conversation_states(current_step_id);
        CREATE INDEX IF NOT EXISTS idx_conversation_states_awaiting ON conversation_states(awaiting_response);
        CREATE INDEX IF NOT EXISTS idx_conversation_states_last_message ON conversation_states(last_message_at);

        -- Ensure one conversation state per contact
        CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_states_contact_unique ON conversation_states(contact_id);

        -- Grant permissions
        GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_states TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_states TO service_role;

        -- RLS Policy
        ALTER TABLE conversation_states ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow authenticated users to manage conversation states" ON conversation_states
            FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Service role full access to conversation states" ON conversation_states
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;