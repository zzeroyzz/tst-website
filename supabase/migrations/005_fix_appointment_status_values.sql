-- Clean up invalid appointment_status values before applying constraints
UPDATE contacts 
SET appointment_status = NULL 
WHERE appointment_status IS NOT NULL 
  AND appointment_status NOT IN ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- Ensure the constraint exists
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_appointment_status_check;
ALTER TABLE contacts ADD CONSTRAINT contacts_appointment_status_check 
  CHECK (appointment_status IN ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'));