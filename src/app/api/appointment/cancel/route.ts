/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/appointment/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, toZonedTime } from 'date-fns-tz';
import { getAppointmentCancellationTemplate } from '@/lib/appointment-email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EASTERN_TIMEZONE = 'America/New_York';

// Function to send cancellation email via Zapier
const sendCancellationEmail = async (contact: any) => {
  if (!process.env.ZAPIER_EMAIL_WEBHOOK_URL) return;

  // Convert UTC to Eastern for email display
  const utcString = contact.scheduled_appointment_at.endsWith('Z')
    ? contact.scheduled_appointment_at
    : `${contact.scheduled_appointment_at}Z`;
  const utcDate = new Date(utcString);
  const easternDate = toZonedTime(utcDate, EASTERN_TIMEZONE);

  const emailData = {
    type: 'appointment_cancellation',
    to: contact.email,
    subject: 'Your consultation has been cancelled - Toasted Sesame Therapy',
    html: getAppointmentCancellationTemplate({
      name: `${contact.name} ${contact.last_name || ''}`.trim(),
      appointmentDate: format(easternDate, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE }),
      appointmentTime: format(easternDate, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE })
    })
  };

  try {
    await fetch(process.env.ZAPIER_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }
};

// POST - Cancel appointment by contact ID (admin function)
export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();

    if (!contactId) {
      return NextResponse.json(
        { message: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // First, get the contact details before cancelling
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .eq('appointment_status', 'scheduled')
      .single();

    if (fetchError || !contact) {
      console.error('Error finding contact:', fetchError);
      return NextResponse.json(
        { message: 'Appointment not found or already cancelled' },
        { status: 404 }
      );
    }

    // Cancel the appointment
    const { data, error } = await supabase
      .from('contacts')
      .update({
        appointment_status: 'cancelled',
        appointment_notes: contact.appointment_notes
          ? `${contact.appointment_notes} | Cancelled by admin`
          : 'Cancelled by admin',
        last_appointment_update: new Date().toISOString()
      })
      .eq('id', contactId)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Failed to cancel appointment' },
        { status: 500 }
      );
    }

    // Send cancellation confirmation email to client
    await sendCancellationEmail(contact);

    // Notify admin about cancellation
    if (process.env.ZAPIER_EMAIL_WEBHOOK_URL) {
      // Convert UTC to Eastern for admin notification
      const utcString = contact.scheduled_appointment_at.endsWith('Z')
        ? contact.scheduled_appointment_at
        : `${contact.scheduled_appointment_at}Z`;
      const utcDate = new Date(utcString);
      const easternDate = toZonedTime(utcDate, EASTERN_TIMEZONE);

      const adminNotification = {
        type: 'appointment_cancelled_notification',
        to: process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com',
        subject: `🚫 Appointment Cancelled by Admin - ${contact.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #C5A1FF;">Appointment Cancelled by Admin</h2>

            <div style="background-color: #FFF3F3; border-left: 4px solid #FF6B6B; padding: 15px; margin: 20px 0;">
              <h3 style="color: #FF6B6B; margin: 0 0 15px;">Cancelled Appointment Details</h3>
              <p style="margin: 5px 0;"><strong>Client:</strong> ${contact.name} ${contact.last_name || ''}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
              ${contact.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${contact.phone}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Original appointment:</strong><br>
              ${format(easternDate, 'EEEE, MMMM d, yyyy \'at\' h:mm a zzz', { timeZone: EASTERN_TIMEZONE })}</p>
            </div>

            <div style="background-color: #F0F9FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
              <h3 style="color: #3B82F6; margin: 0 0 15px;">Actions Taken</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Appointment status updated to "cancelled"</li>
                <li>Client notified via cancellation email</li>
                <li>Calendar slot now available for new bookings</li>
                <li>Appointment notes updated with cancellation reason</li>
              </ul>
            </div>

            ${contact.interested_in && contact.interested_in.length > 0 ? `
            <div style="background-color: #F7BD01; border: 2px solid #000; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px;">Client Background</h3>
              <p style="margin: 5px 0;"><strong>Interested in:</strong> ${contact.interested_in.join(', ')}</p>
              ${contact.scheduling_preference ? `<p style="margin: 5px 0;"><strong>Scheduling preference:</strong> ${contact.scheduling_preference}</p>` : ''}
              ${contact.payment_method ? `<p style="margin: 5px 0;"><strong>Payment method:</strong> ${contact.payment_method}</p>` : ''}
            </div>
            ` : ''}

            <div style="background-color: #E0F2FE; border: 1px solid #0891B2; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #0F766E;">
                <strong>💡 Follow-up suggestion:</strong> Consider reaching out to the client in a few days to see if they'd like to reschedule, unless this was a mutual decision.
              </p>
            </div>

            <p style="margin: 20px 0 0;">The appointment cancellation has been processed successfully.</p>
          </div>
        `
      };

      try {
        await fetch(process.env.ZAPIER_EMAIL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminNotification),
        });
      } catch (error) {
        console.error('Failed to send admin notification:', error);
      }
    }

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
      contact: data[0]
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
