// src/app/api/schedule-consultation/route.ts
//OLD DO NOT USE
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, toZonedTime } from 'date-fns-tz';
import {
  getAppointmentConfirmationTemplate,
  getAppointmentNotificationTemplate,
} from '@/lib/appointment-email-templates';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EASTERN_TIMEZONE = 'America/New_York';

// Email configuration constants
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Toasted Sesame <kato@toastedsesametherapy.com>';

// Function to send emails via Resend
const sendEmail = async (to: string, subject: string, html: string) => {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured');
    return false;
  }

  try {
    const resend = new Resend(RESEND_API_KEY);

    // Split comma-separated emails
    const recipients = to.split(',').map(email => email.trim());

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipients,
      subject,
      html,
    });

    if ((result as any)?.error) {
      console.error('❌ Resend error:', (result as any).error);
      return false;
    }

    console.log('✅ Email sent successfully to:', recipients.join(', '));
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
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
      appointment_status: 'SCHEDULED',
      appointment_notes: 'Scheduled via questionnaire',
      appointment_cancel_token: cancelToken,
      last_appointment_update: new Date().toISOString(),
      // Store questionnaire data if provided
      ...(questionnaireData && {
        interested_in: questionnaireData.interestedIn,
        scheduling_preference: questionnaireData.schedulingPreference,
        payment_method: questionnaireData.paymentMethod,
        budget_works: questionnaireData.budgetWorks,
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

      // Send confirmation email to client
      const clientHtml = getAppointmentConfirmationTemplate({
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
      });

      // Send notification email to admin
      const adminHtml = getAppointmentNotificationTemplate({
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
      });

      // Send both emails via Resend
      await Promise.all([
        sendEmail(
          email || contact.email,
          'Your consultation is confirmed! 📅',
          clientHtml
        ),
        sendEmail(
          `${ADMIN_EMAIL}, kato@toastedsesametherapy.com`,
          `🎉 New Consultation Scheduled - ${name || contact.name}`,
          adminHtml
        ),
      ]);

      // Create dashboard notification
      try {
        const contactName = name || `${contact.name} ${contact.last_name || ''}`.trim();
        const contactEmail = email || contact.email;

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            type: 'appointment',
            title: 'Appointment Scheduled',
            message: `${contactName} scheduled a consultation for ${format(appointmentDateEastern, 'MMM d, yyyy', { timeZone: EASTERN_TIMEZONE })}`,
            contact_id: contactId,
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

    // Send confirmation email to client
    const clientHtml = getAppointmentConfirmationTemplate({
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
    });

    // Send notification email to admin
    const adminHtml = getAppointmentNotificationTemplate({
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
    });

    // Send both emails via Resend
    await Promise.all([
      sendEmail(
        contacts.email,
        'Your consultation is confirmed! 📅',
        clientHtml
      ),
      sendEmail(
        `${ADMIN_EMAIL}, kato@toastedsesametherapy.com`,
        `🎉 New Consultation Scheduled - ${contacts.name}`,
        adminHtml
      ),
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
