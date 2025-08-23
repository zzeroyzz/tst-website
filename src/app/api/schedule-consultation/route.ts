// src/app/api/schedule-consultation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, toZonedTime } from 'date-fns-tz';
import {
  getAppointmentConfirmationTemplate,
  getAppointmentNotificationTemplate,
} from '@/lib/appointment-email-templates';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EASTERN_TIMEZONE = 'America/New_York';

// Enhanced interface for Zapier with calendar fields
interface ZapierEmailData {
  type: string;
  to: string;
  subject: string;
  html: string;

  // Calendar event fields (for appointment confirmations)
  eventTitle?: string;
  eventDescription?: string;
  startDateTime?: string; // ISO format for Google Calendar
  endDateTime?: string; // ISO format for Google Calendar
  attendeeEmail?: string;
  attendeeName?: string;
  location?: string;
}

// Function to send emails via Zapier webhook
const sendEmailViaZapier = async (emailData: ZapierEmailData) => {
  if (!process.env.ZAPIER_EMAIL_WEBHOOK_URL) {
    return;
  }

  try {
    const response = await fetch(process.env.ZAPIER_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      return;
    }
  } catch (error) {
    console.error('Zapier webhook error:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const { token, contactId, name, email, dateTime, questionnaireData } =
      await request.json();

    if (!token || !dateTime) {
      return NextResponse.json(
        { message: 'Missing required fields: token and dateTime' },
        { status: 400 }
      );
    }

    // Handle timezone conversion
    const appointmentUtc = new Date(dateTime);
    if (Number.isNaN(appointmentUtc.getTime())) {
      return NextResponse.json(
        { message: 'Invalid dateTime' },
        { status: 400 }
      );
    }
    const appointmentDateEastern = toZonedTime(
      appointmentUtc,
      EASTERN_TIMEZONE
    );

    // Calculate end time (default 15 minutes)
    const duration = 15; // minutes
    const endTimeUtc = new Date(appointmentUtc);
    endTimeUtc.setMinutes(endTimeUtc.getMinutes() + duration);

    const cancelToken = uuidv4(); // Generate unique cancellation token

    // Prepare the update data object
    const updateData = {
      scheduled_appointment_at: appointmentUtc.toISOString(),
      appointment_status: 'scheduled',
      appointment_notes: 'Scheduled via questionnaire',
      appointment_cancel_token: cancelToken,
      last_appointment_update: new Date().toISOString(),
      // Store questionnaire data if provided
      ...(questionnaireData && {
        interested_in: questionnaireData.interestedIn,
        scheduling_preference: questionnaireData.schedulingPreference,
        payment_method: questionnaireData.paymentMethod,
        budget_works: questionnaireData.budgetWorks,
        questionnaire_completed: true,
        questionnaire_completed_at: new Date().toISOString(),
      }),
    };

    // If contactId is provided, update the contact directly
    if (contactId) {
      const { data, error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', contactId)
        .select();

      if (error) {
        console.error('Database error updating contact:', error);
        return NextResponse.json(
          { message: 'Failed to schedule appointment', error: error.message },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { message: 'Contact not found' },
          { status: 404 }
        );
      }

      const contact = data[0];
      const googleMeetLink =
        process.env.GOOGLE_MEET_LINK ||
        'https://meet.google.com/your-meeting-link';

      // Send confirmation email to client (NO CALENDAR DATA - just the email)
      const clientEmailData: ZapierEmailData = {
        type: 'appointment_confirmation',
        to: email || contact.email,
        subject: 'Your consultation is confirmed! 📅',
        html: getAppointmentConfirmationTemplate({
          name: name || `${contact.name} ${contact.last_name || ''}`.trim(),
          appointmentDate: format(
            appointmentDateEastern,
            'EEEE, MMMM d, yyyy',
            { timeZone: EASTERN_TIMEZONE }
          ),
          appointmentTime:
            format(appointmentDateEastern, 'h:mm a', {
              timeZone: EASTERN_TIMEZONE,
            }) + 'EST',
          googleMeetLink,
          cancelToken,
        }),
        // REMOVED: All calendar event fields to prevent duplicate calendar invites
      };

      // Send notification email to admin (WITH calendar data so it creates an event)
      const adminEmailData: ZapierEmailData = {
        type: 'appointment_notification',
        to: process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com',
        subject: `🎉 New Consultation Scheduled - ${name || contact.name}`,
        html: getAppointmentNotificationTemplate({
          clientName:
            name || `${contact.name} ${contact.last_name || ''}`.trim(),
          clientEmail: email || contact.email,
          appointmentDate: format(
            appointmentDateEastern,
            'EEEE, MMMM d, yyyy',
            { timeZone: EASTERN_TIMEZONE }
          ),
          appointmentTime:
            format(appointmentDateEastern, 'h:mm a', {
              timeZone: EASTERN_TIMEZONE,
            }) + 'EST',
          questionnaireData: questionnaireData,
        }),

        // Include calendar event fields for admin only
        eventTitle:
          `Therapy Session - ${name || contact.name} ${contact.last_name || ''}`.trim(),
        eventDescription: `
Therapy session with ${name || contact.name} ${contact.last_name || ''}
Email: ${email || contact.email}
Phone: ${contact.phone || 'Not provided'}
${
  questionnaireData
    ? `
Interested in: ${questionnaireData.interestedIn?.join(', ') || 'Not specified'}
Scheduling preference: ${questionnaireData.schedulingPreference || 'Not specified'}
Payment method: ${questionnaireData.paymentMethod || 'Not specified'}
`
    : ''
}

Google Meet Link: ${googleMeetLink}
        `.trim(),
        startDateTime: appointmentUtc.toISOString(),
        endDateTime: endTimeUtc.toISOString(),
        attendeeEmail: email || contact.email,
        attendeeName:
          `${name || contact.name} ${contact.last_name || ''}`.trim(),
        location: googleMeetLink,
      };

      // Send both emails via Zapier
      await Promise.all([
        sendEmailViaZapier(clientEmailData),
        sendEmailViaZapier(adminEmailData),
      ]);

      return NextResponse.json({
        message: 'Appointment scheduled successfully',
        contact: contact,
      });
    }

    // If no contactId, find contact by token
    const { data: contacts, error: findError } = await supabase
      .from('contacts')
      .select('*')
      .eq('questionnaire_token', token)
      .single();

    if (findError || !contacts) {
      console.error('Error finding contact by token:', findError);
      return NextResponse.json(
        { message: 'Invalid token or contact not found' },
        { status: 404 }
      );
    }

    // Update the found contact with questionnaire data
    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', contacts.id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Failed to schedule appointment', error: error.message },
        { status: 500 }
      );
    }

    const googleMeetLink =
      process.env.GOOGLE_MEET_LINK ||
      'https://meet.google.com/your-meeting-link';

    // Send confirmation email to client (NO CALENDAR DATA - just the email)
    const clientEmailData: ZapierEmailData = {
      type: 'appointment_confirmation',
      to: contacts.email,
      subject: 'Your consultation is confirmed! 📅',
      html: getAppointmentConfirmationTemplate({
        name: `${contacts.name} ${contacts.last_name || ''}`.trim(),
        appointmentDate: format(appointmentDateEastern, 'EEEE, MMMM d, yyyy', {
          timeZone: EASTERN_TIMEZONE,
        }),
        appointmentTime:
          format(appointmentDateEastern, 'h:mm a', {
            timeZone: EASTERN_TIMEZONE,
          }) + 'EST',
        googleMeetLink,
        cancelToken,
      }),
      // REMOVED: All calendar event fields to prevent duplicate calendar invites
    };

    // Send notification email to admin (WITH calendar data so it creates an event)
    const adminEmailData: ZapierEmailData = {
      type: 'appointment_notification',
      to: process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com',
      subject: `🎉 New Consultation Scheduled - ${contacts.name}`,
      html: getAppointmentNotificationTemplate({
        clientName: `${contacts.name} ${contacts.last_name || ''}`.trim(),
        clientEmail: contacts.email,
        appointmentDate: format(appointmentDateEastern, 'EEEE, MMMM d, yyyy', {
          timeZone: EASTERN_TIMEZONE,
        }),
        appointmentTime:
          format(appointmentDateEastern, 'h:mm a', {
            timeZone: EASTERN_TIMEZONE,
          }) + 'EST',
        questionnaireData: questionnaireData,
      }),

      // Include calendar event fields for admin only
      eventTitle:
        `Therapy Session - ${contacts.name} ${contacts.last_name || ''}`.trim(),
      eventDescription: `
        Therapy session with ${contacts.name} ${contacts.last_name || ''}
        Email: ${contacts.email}
        Phone: ${contacts.phone || 'Not provided'}
        ${
          questionnaireData
            ? `
        Interested in: ${questionnaireData.interestedIn?.join(', ') || 'Not specified'}
        Scheduling preference: ${questionnaireData.schedulingPreference || 'Not specified'}
        Payment method: ${questionnaireData.paymentMethod || 'Not specified'}
        `
            : ''
        }

Google Meet Link: ${googleMeetLink}
      `.trim(),
      startDateTime: appointmentUtc.toISOString(),
      endDateTime: endTimeUtc.toISOString(),
      attendeeEmail: contacts.email,
      attendeeName: `${contacts.name} ${contacts.last_name || ''}`.trim(),
      location: googleMeetLink,
    };

    // Send both emails via Zapier
    await Promise.all([
      sendEmailViaZapier(clientEmailData),
      sendEmailViaZapier(adminEmailData),
    ]);

    try {
      const contactName =
        name || `${contacts?.name} ${contacts?.last_name || ''}`.trim();
      const contactEmail = email || contacts?.email;
      const finalContactId = contactId || contacts?.id;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'appointment',
          title: 'Appointment Scheduled',
          message: `${contactName} scheduled a consultation for ${format(appointmentDateEastern, 'MMM d, yyyy', { timeZone: EASTERN_TIMEZONE })}`,
          contact_id: finalContactId,
          contact_name: contactName,
          contact_email: contactEmail,
          read: false,
          created_at: new Date().toISOString(),
        });

      if (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    // Optional: Send to additional webhook for other integrations
    try {
      if (process.env.ZAPIER_APPOINTMENT_WEBHOOK_URL) {
        await fetch(process.env.ZAPIER_APPOINTMENT_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${contacts.name} ${contacts.last_name || ''}`.trim(),
            email: contacts.email,
            dateTime: appointmentUtc.toISOString(),
            token,
            action: 'appointment_scheduled',
            cancelToken,
            questionnaireData, // Include questionnaire data in webhook
          }),
        });
      }
    } catch (webhookError) {
      console.error('Secondary webhook error (non-fatal):', webhookError);
    }

    return NextResponse.json({
      message: 'Appointment scheduled successfully',
      contact: data[0],
    });
  } catch (error) {
    console.error('Schedule consultation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
