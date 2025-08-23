-- Just ensure the constraint is correct without dropping the column
-- First, set any invalid values to NULL
UPDATE contacts 
SET appointment_status = NULL 
WHERE appointment_status IS NOT NULL 
  AND appointment_status NOT IN ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- Drop any existing constraints and add the correct one
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_appointment_status_check;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_appointment_status_check1;

-- Add the constraint with the correct name
ALTER TABLE contacts ADD CONSTRAINT contacts_appointment_status_check 
  CHECK (appointment_status IS NULL OR appointment_status IN ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'));