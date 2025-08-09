// src/types/contact.ts
export interface Contact {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'scheduled' | 'converted' | 'lost';
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;

  // New appointment fields
  scheduled_appointment_at?: string | null;
  appointment_status: 'none' | 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  appointment_notes?: string | null;
  last_appointment_update?: string;
}

export interface CreateContactData {
  name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source?: string;
  status?: Contact['status'];
  notes?: string;
  tags?: string[];
}

export interface UpdateContactData extends Partial<CreateContactData> {
  scheduled_appointment_at?: string | null;
  appointment_status?: Contact['appointment_status'];
  appointment_notes?: string | null;
}

export interface ScheduleAppointmentData {
  contactId: string;
  appointmentDateTime: Date;
  status: 'scheduled';
  notes?: string;
}
