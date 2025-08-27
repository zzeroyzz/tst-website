import { sendSMS } from '@/lib/twilio/client';
import { sendCustomEmailWithRetry } from '@/lib/email-sender';
import { getAppointmentRescheduleTemplate, getAppointmentCancellationTemplate } from '@/lib/appointment-email-templates';

export interface SMSContext {
  contactId: string;
  contactName: string;
  phoneNumber: string;
  contactUuid?: string;
  appointmentDateTime?: string;
  contactEmail?: string;
  oldAppointmentDateTime?: string;
}

/**
 * Send simple welcome SMS when appointment is booked
 */
export async function sendWelcomeSMS(context: SMSContext): Promise<{ success: boolean; error?: string }> {
  try {
    // Use the exact template from fitFreeTemplateData ID: 1
    let message = "Hi {{client_name}}—this is the Toasted Sesame Care Team for Kay. You're set for {{day_time_et}}. Quick 3 Qs to prep—OK to text here? If needed: reply 2 to RESCHEDULE, 3 to CANCEL, or tap: {{manage_link}}. Reply HELP for support. Reply STOP to opt out.";
    
    if (context.appointmentDateTime) {
      const appointmentDate = new Date(context.appointmentDateTime);
      const dayTime = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });
      
      // Replace template variables
      const manageLink = context.contactUuid ? 
        `https://toastedsesametherapy.com/reschedule/${context.contactUuid}` : 
        'https://toastedsesametherapy.com/manage';
        
      message = message
        .replace(/\{\{client_name\}\}/g, context.contactName)
        .replace(/\{\{day_time_et\}\}/g, dayTime)
        .replace(/\{\{manage_link\}\}/g, manageLink);
    } else {
      message = `Hi ${context.contactName}! Thanks for reaching out to Toasted Sesame Therapy. We'll be in touch soon. Reply HELP for support. Reply STOP to opt out.`;
    }

    const result = await sendSMS(context.phoneNumber, message);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome SMS:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

/**
 * Send reschedule confirmation SMS and email
 */
export async function sendRescheduleSMS(context: SMSContext): Promise<{ success: boolean; error?: string }> {
  try {
    if (!context.appointmentDateTime) {
      return { success: false, error: 'Appointment date time is required for reschedule SMS' };
    }

    const appointmentDate = new Date(context.appointmentDateTime);
    const dayTime = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    // Send SMS
    const message = `Hi ${context.contactName}! Your appointment has been rescheduled to ${dayTime}. We'll see you then! Reply HELP for support. Reply STOP to opt out.`;
    const result = await sendSMS(context.phoneNumber, message);
    
    // Send email if email address is provided
    if (context.contactEmail && process.env.MAILCHIMP_RESCHEDULE_LIST_ID) {
      try {
        const oldDate = context.oldAppointmentDateTime ? new Date(context.oldAppointmentDateTime) : new Date();
        const emailTemplate = getAppointmentRescheduleTemplate({
          name: context.contactName,
          oldAppointmentDate: oldDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          oldAppointmentTime: oldDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
          newAppointmentDate: appointmentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          newAppointmentTime: appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
          googleMeetLink: 'https://meet.google.com/your-meeting-link', // TODO: Get actual meet link
          cancelUrl: context.contactUuid ? `https://toastedsesametherapy.com/reschedule/${context.contactUuid}` : undefined
        });

        await sendCustomEmailWithRetry({
          recipientEmail: context.contactEmail,
          recipientName: context.contactName,
          subject: 'Your appointment has been rescheduled',
          htmlContent: emailTemplate,
          listId: process.env.MAILCHIMP_RESCHEDULE_LIST_ID,
          campaignTitle: `Reschedule Confirmation - ${context.contactName}`,
        });
      } catch (emailError) {
        console.error('Error sending reschedule email:', emailError);
        // Don't fail SMS if email fails
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending reschedule SMS:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

/**
 * Send cancellation confirmation SMS and email
 */
export async function sendCancellationSMS(context: SMSContext): Promise<{ success: boolean; error?: string }> {
  try {
    const rescheduleLink = context.contactUuid ? 
      `https://toastedsesametherapy.com/reschedule/${context.contactUuid}` : 
      'https://toastedsesametherapy.com/manage';

    // Send SMS
    const message = `Hi ${context.contactName}! Your appointment has been cancelled. You can reschedule anytime here: ${rescheduleLink}. Reply HELP for support. Reply STOP to opt out.`;
    const result = await sendSMS(context.phoneNumber, message);
    
    // Send email if email address is provided
    if (context.contactEmail && context.appointmentDateTime && process.env.MAILCHIMP_CANCELLATION_LIST_ID) {
      try {
        const appointmentDate = new Date(context.appointmentDateTime);
        const emailTemplate = getAppointmentCancellationTemplate({
          name: context.contactName,
          appointmentDate: appointmentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          appointmentTime: appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
          cancelUrl: context.contactUuid ? `https://toastedsesametherapy.com/reschedule/${context.contactUuid}` : undefined
        });

        await sendCustomEmailWithRetry({
          recipientEmail: context.contactEmail,
          recipientName: context.contactName,
          subject: 'Your appointment has been cancelled',
          htmlContent: emailTemplate,
          listId: process.env.MAILCHIMP_CANCELLATION_LIST_ID,
          campaignTitle: `Cancellation Confirmation - ${context.contactName}`,
        });
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Don't fail SMS if email fails
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending cancellation SMS:', error);
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}