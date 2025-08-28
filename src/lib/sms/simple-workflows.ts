import { sendSMS } from '@/lib/twilio/client';
import { sendCustomEmailWithRetry } from '@/lib/email-sender';
import { getAppointmentRescheduleTemplate, getAppointmentCancellationTemplate } from '@/lib/appointment-email-templates';
import { createClient } from '@supabase/supabase-js';

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
    let message = "Hi {{client_name}}—this is Kato with the Toasted Sesame Care Team.\n\nYou're set for:\n{{day_time_et}}\n\nIf you need to reschedule or cancel tap:\nhttps://toastedsesametherapy.com/reschedule/{{contact_uuid}}\n\nReply HELP for support. Reply STOP to opt out.\n\nQuick 3 Qs to prep for your consultation, OK to text here?";

    console.log('🚀 sendWelcomeSMS called with:', JSON.stringify(context, null, 2));

    if (context.appointmentDateTime) {
      console.log('✅ appointmentDateTime exists:', context.appointmentDateTime);
      const appointmentDate = new Date(context.appointmentDateTime);
      console.log('🗓️ Created Date object:', appointmentDate);

      const dayTime = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York', // Force EDT/EST timezone
        timeZoneName: 'short',
      });

      console.log('🕐 Formatted Time:', dayTime);

      // Replace template variables
      message = message
        .replace(/\{\{client_name\}\}/g, context.contactName)
        .replace(/\{\{day_time_et\}\}/g, dayTime)
        .replace(/\{\{contact_uuid\}\}/g, context.contactUuid || '');
    } else {
      console.log('⚠️ No appointmentDateTime provided');
      message = `Hi ${context.contactName}! Thanks for reaching out to Toasted Sesame Therapy. We'll be in touch soon. Reply HELP for support. Reply STOP to opt out.`;
    }

    console.log('📱 Final SMS message:', message);
    const result = await sendSMS(context.phoneNumber, message);

    // Save the outbound SMS to the database so it appears in MessagingInterface
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { error: dbError } = await supabase
        .from('crm_messages')
        .insert({
          contact_id: context.contactId,
          content: message,
          direction: 'OUTBOUND',
          message_status: 'SENT',
          message_type: 'SMS',
          twilio_sid: result.sid || null,
        });

      if (dbError) {
        console.error('❌ Failed to save SMS to database:', dbError);
      } else {
        console.log('✅ Welcome SMS saved to database');
      }
    } catch (dbError) {
      console.error('❌ Database save error:', dbError);
    }

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
