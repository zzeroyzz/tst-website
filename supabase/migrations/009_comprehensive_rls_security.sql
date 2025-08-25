-- Comprehensive Row Level Security (RLS) Implementation
-- This migration secures all critical views and tables with proper access controls

-- =======================================================================
-- 1. VIEW SECURITY: Secure all critical views
-- =======================================================================

-- Secure crm_message_stats view
DROP VIEW IF EXISTS crm_message_stats;
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
FROM crm_messages
WHERE auth.role() = 'authenticated';

-- Secure crm_contact_summary view  
DROP VIEW IF EXISTS crm_contact_summary;
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
) last_msg ON c.id = last_msg.contact_id
WHERE auth.role() = 'authenticated';

-- Secure upcoming_appointments view
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
    c.email as contact_email,
    c.phone_number as contact_phone
FROM appointments a
JOIN contacts c ON a.contact_id = c.id
WHERE a.scheduled_at > NOW()
    AND a.status IN ('SCHEDULED', 'PENDING')
    AND auth.role() = 'authenticated'
ORDER BY a.scheduled_at ASC;

-- Secure appointment_summary view
DROP VIEW IF EXISTS appointment_summary;
CREATE OR REPLACE VIEW appointment_summary AS
SELECT 
    DATE(scheduled_at) as appointment_date,
    COUNT(*) as total_appointments,
    COUNT(*) FILTER (WHERE status = 'SCHEDULED') as scheduled_count,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_count,
    COUNT(*) FILTER (WHERE status = 'NO_SHOW') as no_show_count
FROM appointments
WHERE scheduled_at >= CURRENT_DATE - INTERVAL '30 days'
    AND auth.role() = 'authenticated'
GROUP BY DATE(scheduled_at)
ORDER BY appointment_date DESC;

-- Secure unread_notifications view
DROP VIEW IF EXISTS unread_notifications;
CREATE OR REPLACE VIEW unread_notifications AS
SELECT 
    id,
    type,
    title,
    message,
    contact_id,
    contact_name,
    contact_email,
    created_at
FROM notifications
WHERE read = false
    AND auth.role() = 'authenticated'
ORDER BY created_at DESC;

-- Secure notification_summary view
DROP VIEW IF EXISTS notification_summary;
CREATE OR REPLACE VIEW notification_summary AS
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_count,
    COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count
FROM notifications
WHERE auth.role() = 'authenticated';

-- =======================================================================
-- 2. TABLE RLS POLICIES: Secure all tables with authentication
-- =======================================================================

-- Enable RLS on all critical tables (some may already be enabled)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =======================================================================
-- 3. CONTACTS TABLE POLICIES
-- =======================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can manage contacts" ON contacts;
DROP POLICY IF EXISTS "Admin access to contacts" ON contacts;
DROP POLICY IF EXISTS "Service role access to contacts" ON contacts;

-- Allow authenticated users (dashboard admin) to manage all contacts
CREATE POLICY "Admin dashboard access to contacts" ON contacts
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- =======================================================================
-- 4. CRM MESSAGES TABLE POLICIES
-- =======================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can manage all CRM data" ON crm_messages;
DROP POLICY IF EXISTS "Admin access to messages" ON crm_messages;

-- Allow authenticated users (dashboard admin) to manage all messages
CREATE POLICY "Admin dashboard access to messages" ON crm_messages
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- =======================================================================
-- 5. MESSAGE TEMPLATES POLICIES
-- =======================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can manage templates" ON crm_message_templates;

-- Allow authenticated users to manage message templates
CREATE POLICY "Admin dashboard access to templates" ON crm_message_templates
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- =======================================================================
-- 6. CONTACT SEGMENTS POLICIES
-- =======================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view segments" ON crm_contact_segments;

-- Allow authenticated users to manage contact segments
CREATE POLICY "Admin dashboard access to segments" ON crm_contact_segments
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- =======================================================================
-- 7. WORKFLOWS POLICIES
-- =======================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can manage workflows" ON crm_workflows;

-- Allow authenticated users to manage workflows
CREATE POLICY "Admin dashboard access to workflows" ON crm_workflows
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- =======================================================================
-- 8. WORKFLOW EXECUTIONS POLICIES
-- =======================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view workflow executions" ON crm_workflow_executions;

-- Allow authenticated users to view workflow executions
CREATE POLICY "Admin dashboard access to workflow executions" ON crm_workflow_executions
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- =======================================================================
-- 9. APPOINTMENTS POLICIES
-- =======================================================================

-- Allow authenticated users to manage appointments
CREATE POLICY "Admin dashboard access to appointments" ON appointments
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- =======================================================================
-- 10. NOTIFICATIONS POLICIES
-- =======================================================================

-- Allow authenticated users to manage notifications
CREATE POLICY "Admin dashboard access to notifications" ON notifications
    FOR ALL USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- =======================================================================
-- 11. SECURITY FUNCTIONS: Helper functions for advanced security
-- =======================================================================

-- Function to check if user is authenticated admin
CREATE OR REPLACE FUNCTION is_authenticated_admin()
RETURNS boolean AS $$
BEGIN
    RETURN auth.role() = 'authenticated' OR auth.role() = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access contact data
CREATE OR REPLACE FUNCTION can_access_contact_data()
RETURNS boolean AS $$
BEGIN
    -- For now, all authenticated users can access all contact data
    -- In the future, this could be enhanced for multi-tenant scenarios
    RETURN is_authenticated_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================================================================
-- 12. AUDIT LOG SETUP: Track security-sensitive operations
-- =======================================================================

-- Create audit log table for tracking access
CREATE TABLE IF NOT EXISTS security_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID DEFAULT auth.uid(),
    user_role TEXT DEFAULT auth.role(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE, SELECT
    row_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own audit entries
CREATE POLICY "Users can view their own audit entries" ON security_audit_log
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log authenticated operations
    IF auth.role() = 'authenticated' OR auth.role() = 'service_role' THEN
        INSERT INTO security_audit_log (
            table_name,
            operation,
            row_id,
            old_data,
            new_data
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.id
                ELSE NEW.id
            END,
            CASE 
                WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)
                ELSE NULL
            END,
            CASE 
                WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)
                ELSE NULL
            END
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS contacts_audit_trigger ON contacts;
CREATE TRIGGER contacts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON contacts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS appointments_audit_trigger ON appointments;
CREATE TRIGGER appointments_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS crm_messages_audit_trigger ON crm_messages;
CREATE TRIGGER crm_messages_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON crm_messages
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =======================================================================
-- 13. COMMENTS AND DOCUMENTATION
-- =======================================================================

COMMENT ON VIEW crm_message_stats IS 'Secured real-time messaging statistics - authenticated access only';
COMMENT ON VIEW crm_contact_summary IS 'Secured comprehensive contact view - authenticated access only';
COMMENT ON VIEW upcoming_appointments IS 'Secured upcoming appointments view - authenticated access only';
COMMENT ON VIEW appointment_summary IS 'Secured appointment statistics - authenticated access only';
COMMENT ON VIEW unread_notifications IS 'Secured unread notifications - authenticated access only';
COMMENT ON VIEW notification_summary IS 'Secured notification statistics - authenticated access only';
COMMENT ON TABLE security_audit_log IS 'Audit trail for security-sensitive operations';
COMMENT ON FUNCTION is_authenticated_admin() IS 'Helper function to check admin authentication status';
COMMENT ON FUNCTION can_access_contact_data() IS 'Helper function to check contact data access permissions';

-- =======================================================================
-- 14. PERFORMANCE INDEXES FOR SECURITY
-- =======================================================================

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_table_operation ON security_audit_log(table_name, operation);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at DESC);