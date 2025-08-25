-- CRM Database Schema Extensions for Toasted Sesame Therapy
-- Fixed version that works with existing bigint ID contacts table

-- Add CRM-specific columns to existing contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS segments TEXT[] DEFAULT '{}';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS crm_notes TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_contact_status ON contacts(contact_status);
CREATE INDEX IF NOT EXISTS idx_contacts_segments ON contacts USING GIN(segments);
CREATE INDEX IF NOT EXISTS idx_contacts_last_message_at ON contacts(last_message_at);
CREATE INDEX IF NOT EXISTS idx_contacts_custom_fields ON contacts USING GIN(custom_fields);

-- Messages table for CRM messaging functionality
-- Using BIGINT to match existing contacts table ID type
CREATE TABLE IF NOT EXISTS crm_messages (
    id BIGSERIAL PRIMARY KEY,
    contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    message_status VARCHAR(20) NOT NULL DEFAULT 'QUEUED' 
        CHECK (message_status IN ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'RECEIVED')),
    message_type VARCHAR(20) NOT NULL DEFAULT 'SMS' 
        CHECK (message_type IN ('SMS', 'WHATSAPP', 'VOICE')),
    twilio_sid VARCHAR(100),
    error_message TEXT,
    template_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_crm_messages_contact_id ON crm_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_messages_created_at ON crm_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_crm_messages_status ON crm_messages(message_status);
CREATE INDEX IF NOT EXISTS idx_crm_messages_direction ON crm_messages(direction);
CREATE INDEX IF NOT EXISTS idx_crm_messages_twilio_sid ON crm_messages(twilio_sid);

-- Message templates table
CREATE TABLE IF NOT EXISTS crm_message_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL'
        CHECK (category IN ('APPOINTMENT_REMINDER', 'FOLLOW_UP', 'WELCOME', 'QUESTIONNAIRE', 'GENERAL')),
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for templates
CREATE INDEX IF NOT EXISTS idx_crm_templates_category ON crm_message_templates(category);
CREATE INDEX IF NOT EXISTS idx_crm_templates_active ON crm_message_templates(is_active);

-- Contact segments table for better organization
CREATE TABLE IF NOT EXISTS crm_contact_segments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366F1', -- hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default segments
INSERT INTO crm_contact_segments (name, description, color) VALUES
    ('Prospects', 'Potential clients who have shown interest', '#3B82F6'),
    ('Active Clients', 'Current therapy clients', '#10B981'),
    ('Past Clients', 'Former therapy clients', '#6B7280'),
    ('Questionnaire Incomplete', 'Contacts who haven''t completed questionnaire', '#F59E0B'),
    ('Appointment Scheduled', 'Contacts with upcoming appointments', '#8B5CF6'),
    ('No Show', 'Contacts who missed appointments', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Automated workflows table for message automation
CREATE TABLE IF NOT EXISTS crm_workflows (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL
        CHECK (trigger_type IN ('CONTACT_CREATED', 'QUESTIONNAIRE_COMPLETED', 'APPOINTMENT_SCHEDULED', 'APPOINTMENT_MISSED', 'DAYS_SINCE_CONTACT')),
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB NOT NULL, -- Array of actions to perform
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions log
CREATE TABLE IF NOT EXISTS crm_workflow_executions (
    id BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT NOT NULL REFERENCES crm_workflows(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'SKIPPED')),
    executed_actions JSONB DEFAULT '[]',
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for workflows
CREATE INDEX IF NOT EXISTS idx_crm_workflows_trigger ON crm_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_crm_workflows_active ON crm_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_crm_workflow_executions_contact ON crm_workflow_executions(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_workflow_executions_status ON crm_workflow_executions(status);

-- Update contacts message count trigger function
CREATE OR REPLACE FUNCTION update_contact_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE contacts SET 
            message_count = message_count + 1,
            last_message_at = NEW.created_at
        WHERE id = NEW.contact_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE contacts SET 
            message_count = GREATEST(message_count - 1, 0)
        WHERE id = OLD.contact_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic message count updates
DROP TRIGGER IF EXISTS trigger_update_contact_message_count ON crm_messages;
CREATE TRIGGER trigger_update_contact_message_count
    AFTER INSERT OR DELETE ON crm_messages
    FOR EACH ROW EXECUTE FUNCTION update_contact_message_count();

-- Row Level Security (RLS) policies
ALTER TABLE crm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_workflow_executions ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (admin dashboard access)
CREATE POLICY "Authenticated users can manage all CRM data" ON crm_messages
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage templates" ON crm_message_templates
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view segments" ON crm_contact_segments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage workflows" ON crm_workflows
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view workflow executions" ON crm_workflow_executions
    FOR ALL USING (auth.role() = 'authenticated');

-- Create some default message templates
INSERT INTO crm_message_templates (name, content, category, variables) VALUES
    (
        'Appointment Reminder - 24hr',
        'Hi {{name}}, this is a friendly reminder about your therapy consultation tomorrow at {{appointment_time}}. If you need to reschedule, please let us know. Looking forward to meeting you! - Toasted Sesame Therapy',
        'APPOINTMENT_REMINDER',
        ARRAY['name', 'appointment_time']
    ),
    (
        'Welcome New Contact',
        'Welcome {{name}}! Thank you for your interest in Toasted Sesame Therapy. We''re here to support your mental health journey. Please complete your questionnaire when you''re ready: {{questionnaire_link}}',
        'WELCOME',
        ARRAY['name', 'questionnaire_link']
    ),
    (
        'Questionnaire Follow-up',
        'Hi {{name}}, just checking in about your questionnaire. When you''re ready to complete it, you can access it here: {{questionnaire_link}}. No pressure - take your time!',
        'QUESTIONNAIRE',
        ARRAY['name', 'questionnaire_link']
    ),
    (
        'Post-Session Follow-up',
        'Hi {{name}}, thank you for your session today. How are you feeling? Remember, I''m here if you need any support between sessions. Take care!',
        'FOLLOW_UP',
        ARRAY['name']
    )
ON CONFLICT DO NOTHING;

-- Views for easier querying
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
    c.questionnaire_completed,
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

-- Message statistics view
CREATE OR REPLACE VIEW crm_message_stats AS
SELECT 
    COUNT(*) FILTER (WHERE direction = 'OUTBOUND' AND message_status IN ('SENT', 'DELIVERED')) as total_sent,
    COUNT(*) FILTER (WHERE direction = 'INBOUND') as total_received,
    COUNT(DISTINCT contact_id) as total_contacts,
    COALESCE(
        COUNT(*) FILTER (WHERE direction = 'OUTBOUND' AND message_status = 'DELIVERED')::float / 
        NULLIF(COUNT(*) FILTER (WHERE direction = 'OUTBOUND' AND message_status IN ('SENT', 'DELIVERED'))::float, 0),
        0
    ) * 100 as delivery_rate,
    COUNT(*) FILTER (WHERE direction = 'OUTBOUND' AND DATE(created_at) = CURRENT_DATE) as sent_today,
    COUNT(*) FILTER (WHERE direction = 'INBOUND' AND DATE(created_at) = CURRENT_DATE) as received_today
FROM crm_messages;

COMMENT ON TABLE crm_messages IS 'Stores all CRM messages (SMS, WhatsApp, Voice) with Twilio integration';
COMMENT ON TABLE crm_message_templates IS 'Reusable message templates with variable substitution';
COMMENT ON TABLE crm_contact_segments IS 'Contact segmentation for better organization and targeting';
COMMENT ON TABLE crm_workflows IS 'Automated workflow definitions for message automation';
COMMENT ON TABLE crm_workflow_executions IS 'Log of workflow execution history';
COMMENT ON VIEW crm_contact_summary IS 'Comprehensive contact view with message statistics';
COMMENT ON VIEW crm_message_stats IS 'Real-time messaging statistics for dashboard analytics';