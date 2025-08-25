export interface Lead {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  phone?: string; // Alternative phone field for backwards compatibility
  status: string;
  notes?: string;
  created_at: string;
  reminder_at?: string | null;
  reminder_message?: string | null;
  interested_in?: string[];
  scheduling_preference?: string;
  payment_method?: string;
  budget_works?: boolean;
  qualified_lead?: boolean;
  located_in_georgia?: boolean;
  scheduled_appointment_at?: string;
  appointment_status?: string;
  appointment_notes?: string;
  last_appointment_update?: string;
  appointment_cancel_token?: string;
  questionnaire_completed?: boolean;
  questionnaire_completed_at?: string;
  questionnaire_reminder_sent_at?: string;
  questionnaire_token?: string;
  archived?: boolean;
  last_auto_reminder_sent: string | null;
  auto_reminder_count: number;
}
