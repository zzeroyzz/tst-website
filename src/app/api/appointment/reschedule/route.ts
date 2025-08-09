// src/app/api/appointment/reschedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { getAppointmentRescheduleTemplate } from '@/lib/appointment-email-templates';
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
    const { contactId, newDateTime } = await request.json();

    if (!contactId || !newDateTime) {
      return NextResponse.json(
        { message: 'Missing required fields: contactId and newDateTime' },
        { status: 400 }
      );
    }

    // Get the contact with current appointment details
    const { data: contact, error: findError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (findError || !contact) {
      return NextResponse.json(
        { message: 'Contact not found' },
        { status: 404 }
      );
    }

    if (!contact.scheduled_appointment_at) {
      return NextResponse.json(
        { message: 'No existing appointment found for this contact' },
        { status: 404 }
      );
    }

    // Handle timezone conversion for dates
    const oldAppointmentDate = new Date(contact.scheduled_appointment_at);
    const oldAppointmentEastern = toZonedTime(oldAppointmentDate, EASTERN_TIMEZONE);

    // Convert new datetime to Eastern time and then to UTC for storage
  const newAppointmentUtc = new Date(newDateTime);
if (Number.isNaN(newAppointmentUtc.getTime())) {
  return NextResponse.json({ message: 'Invalid newDateTime' }, { status: 400 });
}
const newAppointmentEastern = toZonedTime(newAppointmentUtc, EASTERN_TIMEZONE);

    const newCancelToken = uuidv4(); // Generate new cancellation token

    // Update the appointment in database (store as UTC)
    const { data, error } = await supabase
      .from('contacts')
      .update({
        scheduled_appointment_at: newAppointmentUtc.toISOString(),
        appointment_status: 'scheduled', // Ensure it's marked as scheduled
        appointment_cancel_token: newCancelToken, // New cancel token for new appointment
        last_appointment_update: new Date().toISOString(),
        appointment_notes: contact.appointment_notes ?
          `${contact.appointment_notes} | Rescheduled from ${format(oldAppointmentEastern, 'yyyy-MM-dd HH:mm', { timeZone: EASTERN_TIMEZONE })}` :
          `Rescheduled from ${format(oldAppointmentEastern, 'yyyy-MM-dd HH:mm', { timeZone: EASTERN_TIMEZONE })}`
      })
      .eq('id', contactId)
      .select();

    if (error) {
      console.error('Database error updating appointment:', error);
      return NextResponse.json(
        { message: 'Failed to reschedule appointment', error: error.message },
        { status: 500 }
      );
    }

    // Send reschedule confirmation email to client (format in Eastern time)
    const clientEmailData = {
      type: 'appointment_reschedule',
      to: contact.email,
      subject: 'Your consultation has been rescheduled! 📅',
      html: getAppointmentRescheduleTemplate({
        name: `${contact.name} ${contact.last_name || ''}`.trim(),
        oldAppointmentDate: format(oldAppointmentEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE }),
        oldAppointmentTime: format(oldAppointmentEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE }),
        newAppointmentDate: format(newAppointmentEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE }),
        newAppointmentTime: format(newAppointmentEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE }),
        googleMeetLink: process.env.GOOGLE_MEET_LINK || 'https://meet.google.com/your-meeting-link',
        cancelToken: newCancelToken
      })
    };

    // Send notification email to admin (Kay) (format in Eastern time)
    const adminEmailData = {
      type: 'appointment_reschedule_admin',
      to: process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com',
      subject: `📅 Appointment Rescheduled - ${contact.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #C5A1FF;">Appointment Rescheduled</h2>

          <div style="background-color: #FFF3F3; border-left: 4px solid #FF6B6B; padding: 15px; margin: 20px 0;">
            <h3>Previous Appointment (Cancelled)</h3>
            <p><strong>Date:</strong> ${format(oldAppointmentEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE })}</p>
            <p><strong>Time:</strong> ${format(oldAppointmentEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE })}</p>
          </div>

          <div style="background-color: #F0F9FF; border-left: 4px solid #7FBC8C; padding: 15px; margin: 20px 0;">
            <h3>New Appointment</h3>
            <p><strong>Date:</strong> ${format(newAppointmentEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE })}</p>
            <p><strong>Time:</strong> ${format(newAppointmentEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE })}</p>
          </div>

          <div style="background-color: #F7BD01; border: 2px solid #000; padding: 15px; margin: 20px 0;">
            <h3>Client Information</h3>
            <p><strong>Name:</strong> ${contact.name} ${contact.last_name || ''}</p>
            <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
            ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
          </div>

          <p>The appointment has been rescheduled and the client has been notified via email.</p>
        </div>
      `
    };

    // Send both emails via Zapier
    await Promise.all([
      sendEmailViaZapier(clientEmailData),
      sendEmailViaZapier(adminEmailData)
    ]);

    return NextResponse.json({
      message: 'Appointment rescheduled successfully',
      contact: data[0],
      oldDateTime: oldAppointmentDate.toISOString(),
      newDateTime: newAppointmentUTC.toISOString()
    });

  } catch (error) {
    console.error('Reschedule appointment error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
