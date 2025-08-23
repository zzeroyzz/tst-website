/**
 * API route for immediate appointment email sending
 * Replaces Zapier webhook integration with direct Resend email sending
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createId } from '@paralleldrive/cuid2';
import {
  getAppointmentConfirmationTemplate,
  getAppointmentNotificationTemplate,
  type AppointmentConfirmationData,
  type AppointmentNotificationData,
} from '@/lib/appointment-email-templates';

// Environment configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Toasted Sesame <no-reply@mail.toastedsesametherapy.com>';
const GOOGLE_MEET_LINK = process.env.GOOGLE_MEET_LINK || 'https://meet.google.com/orb-dugk-cab';

interface BookingEmailRequest {
  type: 'APPOINTMENT_BOOKED';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDate: string; // Display format: "Monday, January 15, 2024"
  appointmentTime: string; // Display format: "2:00 PM EST"
  appointmentDateTime: string; // ISO string
  variant: 'nd' | 'affirming' | 'trauma';
}

// Generate a unique cancel token
function generateCancelToken(): string {
  return createId();
}

// Send email using Resend
async function sendEmail(
  resend: Resend,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const result = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject,
    html,
  });

  if (result.error) {
    throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate environment variables
    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: BookingEmailRequest = await request.json();
    
    // Validate required fields
    const { 
      type, 
      clientName, 
      clientEmail, 
      clientPhone,
      appointmentDate, 
      appointmentTime, 
      appointmentDateTime,
      variant 
    } = body;

    if (!type || !clientName || !clientEmail || !appointmentDate || !appointmentTime || !variant) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'APPOINTMENT_BOOKED') {
      return NextResponse.json(
        { error: 'Unsupported email type' },
        { status: 400 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const cancelToken = generateCancelToken();

    // Prepare email data
    const confirmationData: AppointmentConfirmationData = {
      name: clientName,
      appointmentDate,
      appointmentTime,
      googleMeetLink: GOOGLE_MEET_LINK,
      cancelToken,
    };

    const notificationData: AppointmentNotificationData = {
      clientName,
      clientEmail,
      appointmentDate,
      appointmentTime,
    };

    // Send emails concurrently
    const emailPromises = [
      // Client confirmation email
      sendEmail(
        resend,
        clientEmail,
        'Your consultation is confirmed',
        getAppointmentConfirmationTemplate(confirmationData)
      ),
      // Admin notification email
      sendEmail(
        resend,
        ADMIN_EMAIL,
        'New consultation scheduled',
        getAppointmentNotificationTemplate(notificationData)
      ),
    ];

    await Promise.all(emailPromises);

    console.log(`Successfully sent appointment emails for ${clientName} (${clientEmail}) - ${appointmentDate} at ${appointmentTime}`);

    return NextResponse.json({
      success: true,
      message: 'Appointment emails sent successfully',
      emails: {
        confirmation: clientEmail,
        notification: ADMIN_EMAIL,
      },
      cancelToken, // Return for potential future use
    });

  } catch (error) {
    console.error('Failed to send appointment emails:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send appointment emails',
      details: errorMessage,
    }, { status: 500 });
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}