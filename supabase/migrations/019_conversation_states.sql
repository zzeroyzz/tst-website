-- Conversation States Table
-- Tracks the state of human-in-the-loop conversations

CREATE TABLE IF NOT EXISTS conversation_states (
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