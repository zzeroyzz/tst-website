/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/appointment/cancel-link/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { getAppointmentCancellationTemplate } from '@/lib/appointment-email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to send cancellation email via Zapier
const sendCancellationEmail = async (contact: any) => {
  if (!process.env.ZAPIER_EMAIL_WEBHOOK_URL) return;

  const emailData = {
    type: 'appointment_cancellation',
    to: contact.email,
    subject: 'Your consultation has been cancelled - Toasted Sesame Therapy',
    html: getAppointmentCancellationTemplate({
      name: `${contact.name} `,
      appointmentDate: format(new Date(contact.scheduled_appointment_at), 'EEEE, MMMM d, yyyy'),
      appointmentTime: format(new Date(contact.scheduled_appointment_at), 'h:mm a zzz')
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

// GET - Fetch appointment details by cancel token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('appointment_cancel_token', token)
      .eq('appointment_status', 'scheduled')
      .single();

    if (error || !contact) {
      return NextResponse.json(
        { message: 'Appointment not found or already cancelled' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Cancel appointment by token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // First, get the contact details before cancelling
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .eq('appointment_cancel_token', token)
      .eq('appointment_status', 'scheduled')
      .single();

    if (fetchError || !contact) {
      console.error('Error finding contact by token:', fetchError);
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
        appointment_notes: 'Cancelled by client via email link',
        last_appointment_update: new Date().toISOString()
      })
      .eq('appointment_cancel_token', token)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Failed to cancel appointment' },
        { status: 500 }
      );
    }

    // Send cancellation confirmation email
    await sendCancellationEmail(contact);

    // Notify admin about cancellation
    if (process.env.ZAPIER_EMAIL_WEBHOOK_URL) {
      const adminNotification = {
        type: 'appointment_cancelled_notification',
        to: process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com',
        subject: `Appointment Cancelled - ${contact.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Appointment Cancelled</h2>
            <p><strong>Client:</strong> ${contact.name} </p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Original appointment:</strong><br>
            ${format(new Date(contact.scheduled_appointment_at), 'EEEE, MMMM d, yyyy \'at\' h:mm a zzz')}</p>
            <p>The client cancelled their appointment via the email link.</p>
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
