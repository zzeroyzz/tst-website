import { sendSMS } from '@/lib/twilio/client';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SMSWorkflowContext {
  contactId: string;
  contactName: string;
  contactEmail: string;
  phoneNumber: string;
  appointmentDateTime?: string;
  variables?: Record<string, string>;
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  delayMinutes?: number;
}

/**
 * Default SMS templates for the therapy practice
 */
export const DEFAULT_SMS_TEMPLATES: Omit<SMSTemplate, 'id'>[] = [
  {
    name: 'Welcome - New Consultation',
    content:
      "Hi {{name}}! Thanks for scheduling your consultation with Toasted Sesame Therapy. We're looking forward to our session on {{appointment_date}} at {{appointment_time}}. You'll receive a confirmation email shortly with all the details.",
    category: 'WELCOME',
    variables: ['name', 'appointment_date', 'appointment_time'],
    delayMinutes: 0,
  },
  {
    name: 'Questionnaire Reminder',
    content:
      'Hi {{name}}! Before our consultation on {{appointment_date}}, please fill out this brief questionnaire to help us make the most of our time together: {{questionnaire_link}}',
    category: 'QUESTIONNAIRE',
    variables: ['name', 'appointment_date', 'questionnaire_link'],
    delayMinutes: 60, // 1 hour after initial contact
  },
  {
    name: 'Appointment Reminder - 24h',
    content:
      "Hi {{name}}! Just a friendly reminder that your consultation with Toasted Sesame Therapy is tomorrow at {{appointment_time}}. We're excited to connect with you! The video call link is in your confirmation email.",
    category: 'APPOINTMENT_REMINDER',
    variables: ['name', 'appointment_time'],
    delayMinutes: 1440, // 24 hours
  },
  {
    name: 'Appointment Reminder - 2h',
    content:
      "Hi {{name}}! Your consultation starts in 2 hours at {{appointment_time}}. Here's your video call link: {{meeting_link}}. Looking forward to speaking with you!",
    category: 'APPOINTMENT_REMINDER',
    variables: ['name', 'appointment_time', 'meeting_link'],
    delayMinutes: 120, // 2 hours
  },
  {
    name: 'Post-Consultation Follow-up',
    content:
      "Hi {{name}}! Thank you for your consultation today. If you'd like to move forward with therapy, please reply to this message or call us. We're here to support your journey!",
    category: 'FOLLOW_UP',
    variables: ['name'],
    delayMinutes: 60, // 1 hour after appointment
  },
];

/**
 * Replace template variables with actual values
 */
export function replaceSMSVariables(
  template: string,
  variables: Record<string, string>
): string {
  let content = template;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    content = content.replace(new RegExp(placeholder, 'g'), value);
  });

  return content;
}

/**
 * Send SMS using a template
 */
export async function sendSMSFromTemplate(
  templateId: string,
  context: SMSWorkflowContext
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('crm_message_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Prepare variables for replacement
    const variables: Record<string, string> = {
      name: context.contactName,
      email: context.contactEmail,
      ...context.variables,
    };

    // Add appointment-specific variables if available
    if (context.appointmentDateTime) {
      const appointmentDate = new Date(context.appointmentDateTime);
      variables.appointment_date = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      variables.appointment_time = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    }

    // Replace variables in template content
    const message = replaceSMSVariables(template.content, variables);

    // Send SMS
    const smsResult = await sendSMS(context.phoneNumber, message);

    // Store the message in CRM
    await supabase.from('crm_messages').insert([
      {
        contact_id: context.contactId,
        content: message,
        direction: 'OUTBOUND',
        message_status: 'SENT',
        message_type: 'SMS',
        template_id: templateId,
        twilio_sid: smsResult.sid,
      },
    ]);

    return {
      success: true,
      messageSid: smsResult.sid,
    };
  } catch (error) {
    console.error('Error sending SMS from template:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Initialize default SMS templates in the database
 */
export async function initializeDefaultSMSTemplates(): Promise<void> {
  try {
    for (const template of DEFAULT_SMS_TEMPLATES) {
      // Check if template already exists
      const { data: existing } = await supabase
        .from('crm_message_templates')
        .select('id')
        .eq('name', template.name)
        .single();

      if (!existing) {
        // Create the template
        await supabase.from('crm_message_templates').insert([
          {
            name: template.name,
            content: template.content,
            category: template.category,
            variables: template.variables,
            is_active: true,
          },
        ]);

        console.log(`Created SMS template: ${template.name}`);
      }
    }
  } catch (error) {
    console.error('Error initializing SMS templates:', error);
  }
}

/**
 * Execute a complete SMS workflow for a new lead with appointment
 */
export async function executeNewLeadSMSWorkflow(
  context: SMSWorkflowContext
): Promise<{ success: boolean; messages: string[]; errors: string[] }> {
  const messages: string[] = [];
  const errors: string[] = [];

  try {
    // Ensure templates exist
    await initializeDefaultSMSTemplates();

    // Get the welcome template
    const { data: welcomeTemplate } = await supabase
      .from('crm_message_templates')
      .select('id')
      .eq('name', 'Welcome - New Consultation')
      .single();

    if (welcomeTemplate) {
      const result = await sendSMSFromTemplate(welcomeTemplate.id, context);
      if (result.success) {
        messages.push('Welcome SMS sent successfully');
      } else {
        errors.push(`Welcome SMS failed: ${result.error}`);
      }
    } else {
      errors.push('Welcome template not found');
    }

    // Schedule questionnaire reminder (if appointment is more than 1 hour away)
    if (context.appointmentDateTime) {
      const appointmentTime = new Date(context.appointmentDateTime);
      const now = new Date();
      const hoursUntilAppointment =
        (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilAppointment > 2) {
        // Schedule questionnaire reminder for 1 hour from now
        await scheduleDelayedSMS(context, 'Questionnaire Reminder', 60);
        messages.push('Questionnaire reminder scheduled');
      }

      // Schedule appointment reminders
      if (hoursUntilAppointment > 24) {
        await scheduleDelayedSMS(
          context,
          'Appointment Reminder - 24h',
          Math.max(60, (hoursUntilAppointment - 24) * 60)
        );
        messages.push('24-hour reminder scheduled');
      }

      if (hoursUntilAppointment > 2) {
        await scheduleDelayedSMS(
          context,
          'Appointment Reminder - 2h',
          Math.max(120, (hoursUntilAppointment - 2) * 60)
        );
        messages.push('2-hour reminder scheduled');
      }
    }

    return {
      success: errors.length === 0,
      messages,
      errors,
    };
  } catch (error) {
    console.error('Error executing SMS workflow:', error);
    return {
      success: false,
      messages,
      errors: [...errors, (error as Error).message],
    };
  }
}

/**
 * Schedule a delayed SMS message (placeholder for more advanced scheduling)
 * In a production environment, this would integrate with a job queue like Vercel Cron or similar
 */
async function scheduleDelayedSMS(
  context: SMSWorkflowContext,
  templateName: string,
  delayMinutes: number
): Promise<void> {
  try {
    // For now, we'll just log the scheduled message
    // In production, you'd want to use a job queue or cron system
    console.log(
      `Scheduled SMS "${templateName}" for contact ${context.contactId} in ${delayMinutes} minutes`
    );

    // Store the scheduled message intent in the database
    await supabase.from('crm_workflow_executions').insert([
      {
        workflow_id: null, // We could create a proper workflow record
        contact_id: context.contactId,
        status: 'PENDING',
        executed_actions: {
          type: 'delayed_sms',
          template_name: templateName,
          delay_minutes: delayMinutes,
          scheduled_at: new Date(
            Date.now() + delayMinutes * 60 * 1000
          ).toISOString(),
        },
      },
    ]);
  } catch (error) {
    console.error('Error scheduling delayed SMS:', error);
  }
}

/**
 * Process pending scheduled SMS messages (would be called by a cron job)
 */
export async function processScheduledSMSMessages(): Promise<void> {
  try {
    const now = new Date();

    // Get pending SMS executions that are due
    const { data: pendingExecutions, error } = await supabase
      .from('crm_workflow_executions')
      .select('*, contacts(*)')
      .eq('status', 'PENDING')
      .lt('executed_actions->scheduled_at', now.toISOString());

    if (error) {
      console.error('Error fetching pending SMS executions:', error);
      return;
    }

    for (const execution of pendingExecutions || []) {
      try {
        const actions = execution.executed_actions as any;
        if (actions.type === 'delayed_sms') {
          const contact = execution.contacts;

          const context: SMSWorkflowContext = {
            contactId: contact.id,
            contactName: contact.name,
            contactEmail: contact.email,
            phoneNumber: contact.phone_number,
            appointmentDateTime: contact.scheduled_appointment_at,
          };

          // Get template and send SMS
          const { data: template } = await supabase
            .from('crm_message_templates')
            .select('id')
            .eq('name', actions.template_name)
            .single();

          if (template) {
            const result = await sendSMSFromTemplate(template.id, context);

            // Update execution status
            await supabase
              .from('crm_workflow_executions')
              .update({
                status: result.success ? 'COMPLETED' : 'FAILED',
                error_message: result.error || null,
                executed_at: now.toISOString(),
              })
              .eq('id', execution.id);

            console.log(
              `Processed scheduled SMS for contact ${contact.id}: ${result.success ? 'success' : 'failed'}`
            );
          }
        }
      } catch (execError) {
        console.error(`Error processing execution ${execution.id}:`, execError);

        // Mark as failed
        await supabase
          .from('crm_workflow_executions')
          .update({
            status: 'FAILED',
            error_message: (execError as Error).message,
            executed_at: now.toISOString(),
          })
          .eq('id', execution.id);
      }
    }
  } catch (error) {
    console.error('Error processing scheduled SMS messages:', error);
  }
}
