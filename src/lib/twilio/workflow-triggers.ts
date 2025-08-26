/**
 * Automated SMS Workflow Triggers
 * Handles automated message workflows based on various triggers
 */

import { createClient } from '@supabase/supabase-js';
import { executeNewLeadSMSWorkflow, sendSMSFromTemplate, type SMSWorkflowContext } from '@/lib/sms/workflows';
import { scheduleDeliveryTracking } from '@/lib/twilio/delivery-tracking';
import { initializeConversationServer } from '@/lib/conversations/flow-manager-server';
import { sendSMS } from '@/lib/twilio/client';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type WorkflowTrigger = 
  | 'CONTACT_CREATED'
  | 'APPOINTMENT_SCHEDULED'
  | 'APPOINTMENT_REMINDER_24H'
  | 'APPOINTMENT_REMINDER_2H'
  | 'APPOINTMENT_MISSED'
  | 'FOLLOW_UP_AFTER_APPOINTMENT'
  | 'CONTACT_INACTIVE';

export interface WorkflowExecution {
  id: string;
  contactId: string;
  workflowId: string;
  triggerType: WorkflowTrigger;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  scheduledAt: Date;
  executedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowRule {
  id: string;
  name: string;
  triggerType: WorkflowTrigger;
  conditions: Record<string, any>;
  actions: WorkflowAction[];
  isActive: boolean;
  delayMinutes?: number;
}

export interface WorkflowAction {
  type: 'SEND_SMS' | 'UPDATE_CONTACT' | 'CREATE_NOTIFICATION' | 'ADD_TO_SEGMENT';
  templateId?: string;
  variables?: Record<string, string>;
  metadata?: Record<string, any>;
}

/**
 * Trigger workflow based on contact creation (ONLY sends initial welcome message)
 */
export async function triggerContactCreatedWorkflow(
  contactId: string,
  appointmentDateTime?: string
): Promise<{ success: boolean; executions: number; errors: string[] }> {
  try {
    console.log(`Triggering contact created workflow for contact ${contactId}`);

    // Get contact details
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      throw new Error(`Contact not found: ${contactId}`);
    }

    if (!contact.phone_number) {
      console.log(`Contact ${contactId} has no phone number, skipping SMS workflow`);
      return { success: true, executions: 0, errors: [] };
    }

    if (!appointmentDateTime) {
      console.log(`No appointment date provided, skipping welcome message`);
      return { success: true, executions: 0, errors: [] };
    }

    // Initialize conversation flow - this sends ONLY the welcome message
    const conversationState = await initializeConversationServer(
      contactId,
      appointmentDateTime,
      contact.name
    );

    // Send the welcome message via SMS
    const result = await sendSMS(contact.phone_number, conversationState.history[0].messageContent);

    // Store the message in CRM
    await supabase.from('crm_messages').insert([
      {
        contact_id: contactId,
        content: conversationState.history[0].messageContent,
        direction: 'OUTBOUND',
        message_status: 'SENT',
        message_type: 'SMS',
        twilio_sid: result.sid,
      },
    ]);

    // Create workflow execution record
    await supabase.from('crm_workflow_executions').insert([
      {
        contact_id: contactId,
        workflow_id: null,
        status: 'COMPLETED',
        executed_actions: {
          trigger_type: 'CONTACT_CREATED',
          conversation_initialized: true,
          welcome_message_sent: true,
          message_sid: result.sid,
        },
        executed_at: new Date().toISOString(),
      },
    ]);

    return {
      success: true,
      executions: 1, // Only the welcome message
      errors: [],
    };
  } catch (error) {
    console.error('Error triggering contact created workflow:', error);
    return {
      success: false,
      executions: 0,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Trigger appointment reminder workflows
 */
export async function triggerAppointmentReminders(): Promise<{
  processed24h: number;
  processed2h: number;
  errors: string[];
}> {
  try {
    console.log('Triggering appointment reminder workflows');
    
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const errors: string[] = [];

    // Get appointments needing 24-hour reminders
    const { data: appointments24h, error: error24h } = await supabase
      .from('contacts')
      .select('id, name, email, phone_number, scheduled_appointment_at')
      .not('scheduled_appointment_at', 'is', null)
      .gte('scheduled_appointment_at', now.toISOString())
      .lt('scheduled_appointment_at', in24Hours.toISOString())
      .not('phone_number', 'is', null);

    // Get appointments needing 2-hour reminders
    const { data: appointments2h, error: error2h } = await supabase
      .from('contacts')
      .select('id, name, email, phone_number, scheduled_appointment_at')
      .not('scheduled_appointment_at', 'is', null)
      .gte('scheduled_appointment_at', now.toISOString())
      .lt('scheduled_appointment_at', in2Hours.toISOString())
      .not('phone_number', 'is', null);

    if (error24h) errors.push(`24h query error: ${error24h.message}`);
    if (error2h) errors.push(`2h query error: ${error2h.message}`);

    let processed24h = 0;
    let processed2h = 0;

    // Process 24-hour reminders
    if (appointments24h?.length) {
      for (const appointment of appointments24h) {
        try {
          // Check if we've already sent a 24h reminder
          const { data: existingExecution } = await supabase
            .from('crm_workflow_executions')
            .select('id')
            .eq('contact_id', appointment.id)
            .eq('executed_actions->trigger_type', 'APPOINTMENT_REMINDER_24H')
            .single();

          if (existingExecution) {
            continue; // Already sent
          }

          const result = await sendAppointmentReminder(appointment, '24h');
          if (result.success) {
            processed24h++;
          } else {
            errors.push(`24h reminder failed for ${appointment.name}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`Error processing 24h reminder for ${appointment.name}: ${(error as Error).message}`);
        }
      }
    }

    // Process 2-hour reminders
    if (appointments2h?.length) {
      for (const appointment of appointments2h) {
        try {
          // Check if we've already sent a 2h reminder
          const { data: existingExecution } = await supabase
            .from('crm_workflow_executions')
            .select('id')
            .eq('contact_id', appointment.id)
            .eq('executed_actions->trigger_type', 'APPOINTMENT_REMINDER_2H')
            .single();

          if (existingExecution) {
            continue; // Already sent
          }

          const result = await sendAppointmentReminder(appointment, '2h');
          if (result.success) {
            processed2h++;
          } else {
            errors.push(`2h reminder failed for ${appointment.name}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`Error processing 2h reminder for ${appointment.name}: ${(error as Error).message}`);
        }
      }
    }

    console.log(`Appointment reminders processed: ${processed24h} (24h), ${processed2h} (2h)`);

    return {
      processed24h,
      processed2h,
      errors,
    };
  } catch (error) {
    console.error('Error triggering appointment reminders:', error);
    return {
      processed24h: 0,
      processed2h: 0,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Send appointment reminder
 */
async function sendAppointmentReminder(
  appointment: any,
  reminderType: '24h' | '2h'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get appropriate template
    const templateName = reminderType === '24h' 
      ? 'Appointment Reminder - 24h' 
      : 'Appointment Reminder - 2h';

    const { data: template, error: templateError } = await supabase
      .from('crm_message_templates')
      .select('id')
      .eq('name', templateName)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Create context
    const context: SMSWorkflowContext = {
      contactId: appointment.id.toString(),
      contactName: appointment.name,
      contactEmail: appointment.email,
      phoneNumber: appointment.phone_number,
      appointmentDateTime: appointment.scheduled_appointment_at,
      variables: {
        meeting_link: process.env.GOOGLE_MEET_LINK || 'Meeting link in confirmation email',
      },
    };

    // Send SMS
    const result = await sendSMSFromTemplate(template.id, context);

    // Log execution
    await supabase.from('crm_workflow_executions').insert([
      {
        contact_id: appointment.id,
        workflow_id: null,
        status: result.success ? 'COMPLETED' : 'FAILED',
        executed_actions: {
          trigger_type: `APPOINTMENT_REMINDER_${reminderType.toUpperCase()}`,
          template_used: templateName,
          message_sid: result.messageSid,
        },
        error_message: result.error,
        executed_at: new Date().toISOString(),
      },
    ]);

    return { success: result.success, error: result.error };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Handle missed appointment workflow
 */
export async function triggerMissedAppointmentWorkflow(): Promise<{
  processed: number;
  errors: string[];
}> {
  try {
    const now = new Date();
    const errors: string[] = [];

    // Get appointments that were missed (past appointment time + 15 minutes grace period)
    const { data: missedAppointments, error } = await supabase
      .from('contacts')
      .select('id, name, email, phone_number, scheduled_appointment_at')
      .not('scheduled_appointment_at', 'is', null)
      .lt('scheduled_appointment_at', new Date(now.getTime() - 15 * 60 * 1000).toISOString()) // 15 mins ago
      .not('phone_number', 'is', null);

    if (error) {
      errors.push(`Query error: ${error.message}`);
      return { processed: 0, errors };
    }

    let processed = 0;

    if (missedAppointments?.length) {
      for (const appointment of missedAppointments) {
        try {
          // Check if we've already processed this missed appointment
          const { data: existingExecution } = await supabase
            .from('crm_workflow_executions')
            .select('id')
            .eq('contact_id', appointment.id)
            .eq('executed_actions->trigger_type', 'APPOINTMENT_MISSED')
            .single();

          if (existingExecution) {
            continue; // Already processed
          }

          // Update contact segment to include 'No Show'
          await supabase
            .from('contacts')
            .update({
              segments: ['No Show'],
              contact_status: 'INACTIVE',
            })
            .eq('id', appointment.id);

          // Create notification for admin
          await supabase.from('notifications').insert([
            {
              type: 'missed_appointment',
              title: 'Missed Appointment',
              message: `${appointment.name} missed their appointment at ${new Date(appointment.scheduled_appointment_at).toLocaleString()}`,
              contact_id: appointment.id,
              contact_name: appointment.name,
              contact_email: appointment.email,
              read: false,
            },
          ]);

          // Log workflow execution
          await supabase.from('crm_workflow_executions').insert([
            {
              contact_id: appointment.id,
              workflow_id: null,
              status: 'COMPLETED',
              executed_actions: {
                trigger_type: 'APPOINTMENT_MISSED',
                actions_taken: ['updated_segment', 'created_notification'],
              },
              executed_at: new Date().toISOString(),
            },
          ]);

          processed++;
        } catch (error) {
          errors.push(`Error processing missed appointment for ${appointment.name}: ${(error as Error).message}`);
        }
      }
    }

    console.log(`Processed ${processed} missed appointments`);
    return { processed, errors };
  } catch (error) {
    console.error('Error triggering missed appointment workflow:', error);
    return { processed: 0, errors: [(error as Error).message] };
  }
}


/**
 * Master function to process minimal automated workflows
 * Called by cron job - ONLY processes critical automations
 */
export async function processAutomatedWorkflows(): Promise<{
  totalProcessed: number;
  breakdown: Record<string, number>;
  errors: string[];
}> {
  try {
    console.log('Starting minimal automated workflow processing (human-in-the-loop mode)');

    const allErrors: string[] = [];
    let totalProcessed = 0;
    const breakdown: Record<string, number> = {};

    // ONLY process missed appointments (administrative task)
    const missedResults = await triggerMissedAppointmentWorkflow();
    breakdown['missed_appointments'] = missedResults.processed;
    totalProcessed += missedResults.processed;
    allErrors.push(...missedResults.errors);

    // Schedule delivery tracking for pending messages
    await scheduleDeliveryTracking();

    // Note: Reminders and follow-ups are now handled manually through CRM interface
    breakdown['manual_reminders_note'] = 0; // Placeholder to show this is intentional

    console.log(`Minimal automated workflows completed. Total processed: ${totalProcessed}`);

    // Log summary to database
    await supabase.from('workflow_processing_logs').insert([
      {
        total_processed: totalProcessed,
        breakdown: breakdown,
        errors: allErrors,
        processed_at: new Date().toISOString(),
      },
    ]);

    return {
      totalProcessed,
      breakdown,
      errors: allErrors,
    };
  } catch (error) {
    console.error('Error in automated workflow processing:', error);
    return {
      totalProcessed: 0,
      breakdown: {},
      errors: [(error as Error).message],
    };
  }
}