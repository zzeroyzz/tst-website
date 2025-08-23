-- Notifications table for dashboard alerts and activity tracking
-- This provides real-time updates for the admin dashboard

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_contact_id ON notifications(contact_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users (admin dashboard access)
CREATE POLICY "Authenticated users can manage notifications" ON notifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to automatically mark notifications as read after a certain time
CREATE OR REPLACE FUNCTION auto_mark_old_notifications_read()
RETURNS void AS $$
BEGIN
    UPDATE notifications 
    SET read = true, updated_at = NOW()
    WHERE created_at < NOW() - INTERVAL '7 days' 
        AND read = false;
END;
$$ LANGUAGE plpgsql;

-- Create some useful views for the dashboard
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
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW notification_summary AS
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_count,
    COUNT(*) FILTER (WHERE type = 'appointment_scheduled') as appointment_notifications,
    COUNT(*) FILTER (WHERE type = 'message_received') as message_notifications,
    COUNT(*) FILTER (WHERE type = 'questionnaire_completed') as questionnaire_notifications,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_notifications
FROM notifications;

COMMENT ON TABLE notifications IS 'Dashboard notifications for CRM activities and alerts';
COMMENT ON VIEW unread_notifications IS 'All unread notifications for dashboard display';
COMMENT ON VIEW notification_summary IS 'Notification statistics for dashboard overview';