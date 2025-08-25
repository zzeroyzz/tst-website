/**
 * API route for immediate appointment email sending
 * Replaces Zapier webhook integration with direct Resend email sending
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  getAppointmentConfirmationTemplate,
  getAppointmentNotificationTemplate,
  type AppointmentConfirmationData,
  type AppointmentNotificationData,
} from '@/lib/appointment-email-templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com';
const EMAIL_FROM =
  process.env.EMAIL_FROM || 'Toasted Sesame <kato@toastedsesametherapy.com>';
const GOOGLE_MEET_LINK =
  process.env.GOOGLE_MEET_LINK || 'https://meet.google.com/orb-dugk-cab';

// Prefer a canonical public URL if available
const PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  '';

interface BookingEmailRequest {
  type: 'APPOINTMENT_BOOKED';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDateTime: string;
  variant: 'nd' | 'affirming' | 'trauma';
  uuid?: string; // ONLY token we will use
}

async function sendEmail(
  resend: Resend,
  to: string | string[],
  subject: string,
  html: string
): Promise<void> {
  const recipients = Array.isArray(to) ? to : to.split(',').map(email => email.trim());
  const result = await resend.emails.send({
    from: EMAIL_FROM,
    to: recipients,
    subject,
    html,
  });
  if ((result as any)?.error) {
    throw new Error(`Failed to send email: ${JSON.stringify((result as any).error)}`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {

    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const body: BookingEmailRequest = await request.json();

    const {
      type,
      clientName,
      clientEmail,
      clientPhone,
      appointmentDate,
      appointmentTime,
      variant,
      uuid, // THE cancel token
    } = body;

    if (!type || !clientName || !clientEmail || !appointmentDate || !appointmentTime || !variant) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (type !== 'APPOINTMENT_BOOKED') {
      return NextResponse.json({ error: 'Unsupported email type' }, { status: 400 });
    }

    // Only uuid is allowed as the cancel token
    const cancelToken = uuid;

    // Build base URL reliably
    const originFromHeader = request.headers.get('origin') || '';
    const originFromUrl = request.nextUrl?.origin || '';
    const baseUrl = (PUBLIC_BASE_URL || originFromHeader || originFromUrl).replace(/\/+$/, '');

    const cancelUrl =
      cancelToken && baseUrl
        ? `${baseUrl}/cancel-appointment/${encodeURIComponent(cancelToken)}`
        : null;

    const resend = new Resend(RESEND_API_KEY);

    const confirmationData: AppointmentConfirmationData = {
      name: clientName,
      appointmentDate,
      appointmentTime,
      googleMeetLink: GOOGLE_MEET_LINK,
      cancelToken: cancelToken ?? undefined,
      cancelUrl: cancelUrl ?? undefined,
    };

    const notificationData: AppointmentNotificationData = {
      clientName,
      clientEmail,
      clientPhone,
      appointmentDate,
      appointmentTime,
    };

    const results = {
      clientEmailSent: false,
      adminEmailSent: false,
      errors: [] as string[],
      debug: { cancelUrl, cancelToken, baseUrl },
    };

    try {
      const html = getAppointmentConfirmationTemplate(confirmationData);
      await sendEmail(resend, clientEmail, 'Your consultation is confirmed', html);
      results.clientEmailSent = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.errors.push(`clientEmail: ${msg}`);
      console.error('❌ Client email failed:', {
        to: clientEmail,
        error: msg,
        confirmationData
      });
    }

    try {
      const html = getAppointmentNotificationTemplate(notificationData);
      await sendEmail(resend, `${ADMIN_EMAIL}, kato@toastedsesametherapy.com`, 'New consultation scheduled', html);
      results.adminEmailSent = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.errors.push(`adminEmail: ${msg}`);
      console.error('❌ Admin email failed:', {
        to: ADMIN_EMAIL,
        error: msg,
        notificationData
      });
    }

    const ok = results.clientEmailSent || results.adminEmailSent;
    return NextResponse.json(
      ok
        ? { success: true, ...results }
        : { success: false, ...results },
      { status: ok ? 200 : 500 }
    );
  } catch (error) {
    console.error('Failed to send appointment emails:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
