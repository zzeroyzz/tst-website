-- Appointments table for scheduling functionality
-- Fixed version using BIGINT to match existing contacts table

CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    time_zone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Add appointment-related columns to contacts table if they don't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS scheduled_appointment_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS appointment_status VARCHAR(20)
    CHECK (appointment_status IN ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'));

-- Create indexes for new appointment columns
CREATE INDEX IF NOT EXISTS idx_contacts_scheduled_appointment_at ON contacts(scheduled_appointment_at);
CREATE INDEX IF NOT EXISTS idx_contacts_appointment_status ON contacts(appointment_status);

-- Function to update contact appointment status when appointment changes
CREATE OR REPLACE FUNCTION update_contact_appointment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE contacts SET 
            scheduled_appointment_at = NEW.scheduled_at,
            appointment_status = NEW.status,
            updated_at = NOW()
        WHERE id = NEW.contact_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- When appointment is deleted, clear appointment info from contact
        UPDATE contacts SET 
            scheduled_appointment_at = NULL,
            appointment_status = NULL,
            updated_at = NOW()
        WHERE id = OLD.contact_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic contact appointment status updates
DROP TRIGGER IF EXISTS trigger_update_contact_appointment_status ON appointments;
CREATE TRIGGER trigger_update_contact_appointment_status
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_contact_appointment_status();

-- Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users (admin dashboard access)
CREATE POLICY "Authenticated users can manage appointments" ON appointments
    FOR ALL USING (auth.role() = 'authenticated');

-- Add some useful views
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
ORDER BY a.scheduled_at ASC;

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
GROUP BY DATE(scheduled_at)
ORDER BY appointment_date DESC;

COMMENT ON TABLE appointments IS 'Appointment scheduling with contact integration';
COMMENT ON VIEW upcoming_appointments IS 'All upcoming appointments with contact details';
COMMENT ON VIEW appointment_summary IS 'Daily appointment statistics for the last 30 days';