// src/types/contact.ts
export interface Contact {
  id: string;
  uuid: string;
  name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  position?: string;
  source?: string;
  status:
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'scheduled'
    | 'converted'
    | 'lost';
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;

  // New appointment fields
  scheduled_appointment_at?: string | null;
  appointment_status:
    | 'PENDING'
    | 'SCHEDULED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';
  appointment_notes?: string | null;
  last_appointment_update?: string;
}


