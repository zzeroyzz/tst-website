/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/schedule-consultation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, toZonedTime } from 'date-fns-tz';
import { getAppointmentConfirmationTemplate, getAppointmentNotificationTemplate } from '@/lib/appointment-email-templates';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EASTERN_TIMEZONE = 'America/New_York';

// Function to send emails via Zapier webhook
const sendEmailViaZapier = async (emailData: any) => {
  if (!process.env.ZAPIER_EMAIL_WEBHOOK_URL) {
    console.log('No Zapier webhook URL configured, skipping email');
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
      console.error('Zapier webhook failed:', response.status, response.statusText);
    } else {
      console.log('Email sent successfully via Zapier');
    }
  } catch (error) {
    console.error('Zapier webhook error:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const { token, contactId, name, email, dateTime, questionnaireData } = await request.json();

    if (!token || !dateTime) {
      return NextResponse.json(
        { message: 'Missing required fields: token and dateTime' },
        { status: 400 }
      );
    }

    // Handle timezone conversion
const appointmentUtc = new Date(dateTime);
if (Number.isNaN(appointmentUtc.getTime())) {
  return NextResponse.json({ message: 'Invalid dateTime' }, { status: 400 });
}
const appointmentDateEastern = toZonedTime(appointmentUtc, EASTERN_TIMEZONE);

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
        questionnaire_completed_at: new Date().toISOString()
      })
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

      // Send confirmation email to client (format in Eastern time)
      const clientEmailData = {
        type: 'appointment_confirmation',
        to: email || data[0].email,
        subject: 'Your consultation is confirmed! 📅',
        html: getAppointmentConfirmationTemplate({
          name: name || `${data[0].name} ${data[0].last_name}`,
          appointmentDate: format(appointmentDateEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE }),
          appointmentTime: format(appointmentDateEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE }),
          googleMeetLink: process.env.GOOGLE_MEET_LINK || 'https://meet.google.com/your-meeting-link',
          cancelToken: cancelToken
        })
      };

      // Send notification email to admin (Kay) (format in Eastern time)
      const adminEmailData = {
        type: 'appointment_notification',
        to: process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com',
        subject: `🎉 New Consultation Scheduled - ${name || data[0].name}`,
        html: getAppointmentNotificationTemplate({
          clientName: name || `${data[0].name} ${data[0].last_name}`,
          clientEmail: email || data[0].email,
          appointmentDate: format(appointmentDateEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE }),
          appointmentTime: format(appointmentDateEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE }),
          questionnaireData: questionnaireData
        })
      };

      // Send both emails via Zapier
      await Promise.all([
        sendEmailViaZapier(clientEmailData),
        sendEmailViaZapier(adminEmailData)
      ]);

      return NextResponse.json({
        message: 'Appointment scheduled successfully',
        contact: data[0]
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

    // Send confirmation email to client (format in Eastern time)
    const clientEmailData = {
      type: 'appointment_confirmation',
      to: contacts.email,
      subject: 'Your consultation is confirmed! 📅',
      html: getAppointmentConfirmationTemplate({
        name: `${contacts.name} ${contacts.last_name}`,
        appointmentDate: format(appointmentDateEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE }),
        appointmentTime: format(appointmentDateEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE }),
        googleMeetLink: process.env.GOOGLE_MEET_LINK || 'https://meet.google.com/your-meeting-link',
        cancelToken: cancelToken
      })
    };

    // Send notification email to admin (Kay) (format in Eastern time)
    const adminEmailData = {
      type: 'appointment_notification',
      to: process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com',
      subject: `🎉 New Consultation Scheduled - ${contacts.name}`,
      html: getAppointmentNotificationTemplate({
        clientName: `${contacts.name} ${contacts.last_name}`,
        clientEmail: contacts.email,
        appointmentDate: format(appointmentDateEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE }),
        appointmentTime: format(appointmentDateEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE }),
        questionnaireData: questionnaireData
      })
    };

    // Send both emails via Zapier
    await Promise.all([
      sendEmailViaZapier(clientEmailData),
      sendEmailViaZapier(adminEmailData)
    ]);

    // Optional: Send to additional webhook for other integrations
    try {
      if (process.env.ZAPIER_APPOINTMENT_WEBHOOK_URL) {
        await fetch(process.env.ZAPIER_APPOINTMENT_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${contacts.name} ${contacts.last_name}`,
            email: contacts.email,
            dateTime: appointmentDateUTC.toISOString(), // Send UTC to webhook
            token,
            action: 'appointment_scheduled',
            cancelToken,
            questionnaireData // Include questionnaire data in webhook
          }),
        });
      }
    } catch (webhookError) {
      console.error('Secondary webhook error (non-fatal):', webhookError);
    }

    return NextResponse.json({
      message: 'Appointment scheduled successfully',
      contact: data[0]
    });

  } catch (error) {
    console.error('Schedule consultation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
