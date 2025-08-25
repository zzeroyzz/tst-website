// src/app/api/lead/cancel/[leadId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, toZonedTime } from 'date-fns-tz';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EASTERN_TIMEZONE = 'America/New_York';

// Function to send cancellation email via Resend
const sendCancellationEmail = async (lead: any) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return;

  const appointmentDateTime = new Date(
    `${lead.appointment_date}T${lead.appointment_time}Z`
  );
  const appointmentEastern = toZonedTime(appointmentDateTime, EASTERN_TIMEZONE);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; margin-bottom: 20px;">Hi ${lead.name}! 💙</h2>

      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">Session Cancelled</h3>
        <p style="color: #856404; margin: 10px 0;">Your free grounding plan session scheduled for:</p>
        <p style="font-size: 18px; margin: 10px 0; color: #856404;"><strong>📅 ${format(appointmentEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE })}</strong></p>
        <p style="font-size: 18px; margin: 10px 0; color: #856404;"><strong>🕐 ${format(appointmentEastern, 'h:mm a', { timeZone: EASTERN_TIMEZONE })} EST</strong></p>
        <p style="color: #856404;">has been cancelled.</p>
      </div>

      <h3 style="color: #333;">Want to Reschedule?</h3>
      <p style="color: #555; line-height: 1.6;">
        We'd still love to help you create your personalized grounding plan!
        If you'd like to schedule a new session, simply reply to this email or
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/book" style="color: #1976d2;">visit our booking page</a>.
      </p>

      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #1976d2;"><strong>💡 Remember:</strong> Our grounding plan sessions are completely free and can help you manage stress and triggers in just 15 minutes.</p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

      <p style="color: #666; font-size: 14px;">
        Questions? Reply to this email or call us at (555) 123-4567.<br>
        We're here when you're ready!<br><br>
        Kay<br>
        Licensed Professional Counselor
      </p>
    </div>
  `;

  try {
    const resend = new Resend(RESEND_API_KEY);
    const EMAIL_FROM = process.env.EMAIL_FROM || 'Toasted Sesame <kato@toastedsesametherapy.com>';
    
    await resend.emails.send({
      from: EMAIL_FROM,
      to: [lead.email],
      subject: 'Your grounding plan session has been cancelled',
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }
};

// GET - Fetch lead details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('lead_status', 'scheduled')
      .single();

    if (error || !lead) {
      return NextResponse.json(
        { message: 'Appointment not found or already cancelled' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Cancel appointment by lead ID
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;

    // First, get the lead details before cancelling
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('lead_status', 'scheduled')
      .single();

    if (fetchError || !lead) {
      console.error('Error finding lead:', fetchError);
      return NextResponse.json(
        { message: 'Appointment not found or already cancelled' },
        { status: 404 }
      );
    }

    // Cancel the appointment
    const { data, error } = await supabase
      .from('leads')
      .update({
        lead_status: 'cancelled',
        notes: (lead.notes || '') + ' | Cancelled via cancellation link',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Failed to cancel appointment' },
        { status: 500 }
      );
    }

    // Send cancellation confirmation email
    await sendCancellationEmail(lead);

    // Notify admin about cancellation via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      const appointmentDateTime = new Date(
        `${lead.appointment_date}T${lead.appointment_time}Z`
      );
      const appointmentEastern = toZonedTime(
        appointmentDateTime,
        EASTERN_TIMEZONE
      );

      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #C5A1FF;">Grounding Session Cancelled by Client</h2>

          <div style="background-color: #FFF3F3; border-left: 4px solid #FF6B6B; padding: 15px; margin: 20px 0;">
            <h3 style="color: #FF6B6B; margin: 0 0 15px;">Cancelled Session Details</h3>
            <p style="margin: 5px 0;"><strong>Client:</strong> ${lead.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
            ${lead.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${lead.phone}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Original session:</strong><br>
            ${format(appointmentEastern, "EEEE, MMMM d, yyyy 'at' h:mm a", { timeZone: EASTERN_TIMEZONE })} EST</p>
            <p style="margin: 5px 0;"><strong>Source:</strong> ${lead.source || 'Unknown'}</p>
            <p style="margin: 5px 0;"><strong>Session Type:</strong> Free Grounding Plan (15 minutes)</p>
          </div>

          <div style="background-color: #F0F9FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
            <h3 style="color: #3B82F6; margin: 0 0 15px;">How They Cancelled</h3>
            <p style="margin: 0;">The client cancelled their grounding session using the cancellation link from their confirmation email.</p>
          </div>

          <div style="background-color: #E0F2FE; border: 1px solid #0891B2; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #0F766E;">
              <strong>💡 Follow-up suggestion:</strong> Since this was a free session, consider sending a gentle follow-up in a few days with alternative resources or an invitation to reschedule when they're ready.
            </p>
          </div>

          <p style="margin: 20px 0 0;">The client has been sent a cancellation confirmation email with options to reschedule.</p>
        </div>
      `;

      try {
        const resend = new Resend(RESEND_API_KEY);
        const EMAIL_FROM = process.env.EMAIL_FROM || 'Toasted Sesame <kato@toastedsesametherapy.com>';
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com';
        
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [`${ADMIN_EMAIL}, kato@toastedsesametherapy.com`],
          subject: `🚫 Grounding Session Cancelled - ${lead.name}`,
          html: adminHtml,
        });
      } catch (error) {
        console.error('Failed to send admin notification:', error);
      }
    }

    // Create notification in database
    try {
      await supabase.from('notifications').insert({
        type: 'grounding_session',
        title: 'Grounding Session Cancelled',
        message: `${lead.name} cancelled their grounding plan session`,
        contact_id: null,
        contact_name: lead.name,
        contact_email: lead.email,
        read: false,
        created_at: new Date().toISOString(),
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
      lead: data[0],
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
