// src/app/api/appointment/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, toZonedTime } from 'date-fns-tz';
import { getAppointmentCancellationTemplate } from '@/lib/appointment-email-templates';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EASTERN_TIMEZONE = 'America/New_York';

export async function POST(request: NextRequest) {
  try {
    const { uuid } = await request.json();

    if (!uuid) {
      return NextResponse.json(
        { message: 'UUID is required' },
        { status: 400 }
      );
    }

    // 1) Fetch the contact with scheduled appointment
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .eq('uuid', uuid)
      .eq('appointment_status', 'SCHEDULED')
      .single();

    if (fetchError || !contact) {
      console.error('Error finding contact by uuid:', fetchError);
      return NextResponse.json(
        { message: 'Appointment not found or already cancelled' },
        { status: 404 }
      );
    }

    // 2) Cancel appointment
    const { data: updatedRows, error: updateError } = await supabase
      .from('contacts')
      .update({
        appointment_status: 'CANCELLED',
        appointment_notes: contact.appointment_notes
          ? `${contact.appointment_notes} | Cancelled`
          : 'Cancelled by client',
        last_appointment_update: new Date().toISOString(),
      })
      .eq('uuid', uuid)
      .select();

    if (updateError) {
      console.error('Database error while cancelling:', updateError);
      return NextResponse.json(
        { message: 'Failed to cancel appointment' },
        { status: 500 }
      );
    }

    const cancelled = updatedRows?.[0] ?? contact;

    // 3) Send cancellation emails via Resend
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY!;
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com';
      const EMAIL_FROM = process.env.EMAIL_FROM || 'Toasted Sesame <kato@toastedsesametherapy.com>';

      if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured; skipping emails.');
      } else {
        const resend = new Resend(RESEND_API_KEY);

        // Convert UTC -> Eastern for email body
        const appointmentUtc = new Date(contact.scheduled_appointment_at);
        const appointmentEastern = toZonedTime(appointmentUtc, EASTERN_TIMEZONE);

        // Build base URL for reschedule links
        const originFromHeader = request.headers.get('origin') || '';
        const originFromUrl = request.nextUrl?.origin || '';
        const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
        const baseUrl = (PUBLIC_BASE_URL || originFromHeader || originFromUrl).replace(/\/+$/, '');
        const rescheduleUrl = baseUrl ? `${baseUrl}/reschedule/${encodeURIComponent(contact.uuid)}` : undefined;

        const clientHtml = getAppointmentCancellationTemplate({
          name: `${contact.name} ${contact.last_name || ''}`.trim(),
          appointmentDate: format(appointmentEastern, 'EEEE, MMMM d, yyyy', {
            timeZone: EASTERN_TIMEZONE,
          }),
          appointmentTime: format(appointmentEastern, 'h:mm a zzzz', {
            timeZone: EASTERN_TIMEZONE,
          }),
          cancelUrl: rescheduleUrl,
          cancelToken: contact.uuid,
        });

        // Client email
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [contact.email],
          subject: 'Your consultation has been cancelled',
          html: clientHtml,
        });

        // Admin notification email
        console.log('📧 Sending cancellation admin email...');
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [ADMIN_EMAIL, 'kato@toastedsesametherapy.com'],
          subject: `🚫 Appointment Cancelled - ${contact.name}`,
          html: `
            <div style="font-family:Arial,sans-serif">
              <h2>Appointment Cancelled</h2>
              <p><strong>Client:</strong> ${contact.name} ${contact.last_name || ''}</p>
              <p><strong>Email:</strong> ${contact.email}</p>
              <p><strong>Original time (ET):</strong> ${format(
                appointmentEastern,
                "EEEE, MMMM d, yyyy 'at' h:mm a zzz",
                { timeZone: EASTERN_TIMEZONE }
              )}</p>
              <p>Status updated to <b>CANCELLED</b>.</p>
            </div>
          `,
        });
        console.log('✅ Cancellation admin email sent successfully');
      }
    } catch (emailErr) {
      console.error('❌ Cancellation emails failed:', emailErr);
    }

    // 4) Insert dashboard notification (non-blocking)
    try {
      await supabase.from('notifications').insert({
        type: 'appointment',
        title: 'Appointment Cancelled',
        message: `${contact.name}'s consultation was cancelled`,
        contact_id: contact.id,
        contact_uuid: contact.uuid,
        contact_name: `${contact.name} ${contact.last_name || ''}`.trim(),
        contact_email: contact.email,
        read: false,
        created_at: new Date().toISOString(),
      });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
      contact: cancelled,
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
