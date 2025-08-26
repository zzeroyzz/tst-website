-- Add missing columns to contacts table

-- Add uuid column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='contacts' AND column_name='uuid'
    ) THEN
        ALTER TABLE contacts ADD COLUMN uuid UUID DEFAULT gen_random_uuid() UNIQUE;
        
        -- Update existing rows to have UUIDs
        UPDATE contacts SET uuid = gen_random_uuid() WHERE uuid IS NULL;
    END IF;
END $$;

-- Add scheduled_appointment_at column if it doesn't exist  
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='contacts' AND column_name='scheduled_appointment_at'
    ) THEN
        ALTER TABLE contacts ADD COLUMN scheduled_appointment_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create index on uuid column
CREATE INDEX IF NOT EXISTS idx_contacts_uuid ON contacts(uuid);