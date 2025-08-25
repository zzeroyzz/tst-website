// src/app/api/appointment/reschedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, toZonedTime } from 'date-fns-tz';
import { getAppointmentRescheduleTemplate } from '@/lib/appointment-email-templates';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EASTERN_TIMEZONE = 'America/New_York';
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'care@toastedsesametherapy.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Toasted Sesame <kato@toastedsesametherapy.com>';

// Function to send emails via Resend
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

export async function POST(request: NextRequest) {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const { uuid, contactId, newDateTime } = await request.json();

    // Support both UUID (new) and contactId (legacy) for backwards compatibility
    const lookupField = uuid ? 'uuid' : 'id';
    const lookupValue = uuid || contactId;

    if (!lookupValue || !newDateTime) {
      return NextResponse.json(
        { message: 'Missing required fields: uuid (or contactId) and newDateTime' },
        { status: 400 }
      );
    }

    // Validate UUID format if provided
    if (uuid && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
      console.error('Invalid UUID format:', uuid);
      return NextResponse.json(
        { message: 'Invalid UUID format' },
        { status: 400 }
      );
    }

    // Get the contact with current appointment details
    let { data: contact, error: findError } = await supabase
      .from('contacts')
      .select('*')
      .eq(lookupField, lookupValue)
      .single();

    // If UUID lookup failed, try user_id field as fallback (like cancel-link API)
    if ((findError || !contact) && uuid) {
      const { data: altContact, error: altError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', uuid)
        .single();

      if (altContact) {
        contact = altContact;
        findError = null;
      } else {
        findError = altError || findError;
      }
    }

    let isLead = false;

    // If still no contact found, check leads table
    if ((findError || !contact) && uuid) {
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', uuid)
        .single();

      if (leadData) {
        console.log('Rescheduling appointment for lead:', leadData);
        isLead = true;
        findError = null;

        // Convert lead to contact-like structure for processing
        contact = {
          id: leadData.id,
          uuid: uuid,
          name: leadData.name,
          last_name: '', // leads don't have last_name
          email: leadData.email,
          phone: leadData.phone_number,
          scheduled_appointment_at: leadData.scheduled_appointment_at,
          appointment_status: leadData.appointment_status,
          appointment_notes: leadData.appointment_notes,
          appointment_cancel_token: leadData.appointment_cancel_token,
        };
      } else {
        findError = leadError || findError;
      }
    }

    if (findError || !contact) {
      console.error('Contact/Lead lookup failed:', findError, 'for lookup:', lookupField, lookupValue);
      return NextResponse.json(
        {
          message: 'Contact not found. The appointment link may have expired or is invalid.',
          details: process.env.NODE_ENV === 'development' ? `Lookup failed for ${lookupField}: ${lookupValue}` : undefined
        },
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
    const oldAppointmentEastern = toZonedTime(
      oldAppointmentDate,
      EASTERN_TIMEZONE
    );

    // Convert new datetime to Eastern time and then to UTC for storage
    const newAppointmentUtc = new Date(newDateTime);
    if (Number.isNaN(newAppointmentUtc.getTime())) {
      return NextResponse.json(
        { message: 'Invalid newDateTime' },
        { status: 400 }
      );
    }
    const newAppointmentEastern = toZonedTime(
      newAppointmentUtc,
      EASTERN_TIMEZONE
    );

    // Use existing contact UUID as cancel token (no need to generate new one)

    // Update the appointment in database (store as UTC) - handle both contacts and leads
    const tableName = isLead ? 'leads' : 'contacts';
    const updateFields: any = {
      scheduled_appointment_at: newAppointmentUtc.toISOString(),
      appointment_status: 'SCHEDULED', // Ensure it's marked as scheduled
      // Keep existing cancel token (contact.uuid) - no need to change it
      appointment_notes: contact.appointment_notes
        ? `${contact.appointment_notes} | Rescheduled from ${format(oldAppointmentEastern, 'yyyy-MM-dd HH:mm', { timeZone: EASTERN_TIMEZONE })}`
        : `Rescheduled from ${format(oldAppointmentEastern, 'yyyy-MM-dd HH:mm', { timeZone: EASTERN_TIMEZONE })}`,
    };

    // Add last_appointment_update for contacts only (leads table may not have this field)
    if (!isLead) {
      updateFields.last_appointment_update = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(updateFields)
      .eq(isLead ? 'id' : lookupField, isLead ? uuid : lookupValue)
      .select();

    if (error) {
      console.error('Database error updating appointment:', error);
      return NextResponse.json(
        { message: 'Failed to reschedule appointment', error: error.message },
        { status: 500 }
      );
    }

    // Initialize Resend client
    const resend = new Resend(RESEND_API_KEY);

    // Generate email templates
    const clientEmailHtml = getAppointmentRescheduleTemplate({
      name: `${contact.name} ${contact.last_name || ''}`.trim(),
      oldAppointmentDate: format(
        oldAppointmentEastern,
        'EEEE, MMMM d, yyyy',
        { timeZone: EASTERN_TIMEZONE }
      ),
      oldAppointmentTime: format(oldAppointmentEastern, 'h:mm a zzz', {
        timeZone: EASTERN_TIMEZONE,
      }),
      newAppointmentDate: format(
        newAppointmentEastern,
        'EEEE, MMMM d, yyyy',
        { timeZone: EASTERN_TIMEZONE }
      ),
      newAppointmentTime: format(newAppointmentEastern, 'h:mm a zzz', {
        timeZone: EASTERN_TIMEZONE,
      }),
      googleMeetLink:
        process.env.GOOGLE_MEET_LINK ||
        'https://meet.google.com/orb-dugk-cab',
      cancelToken: contact.uuid,
    });

    const adminEmailHtml = getAppointmentRescheduleTemplate({
      name: `${contact.name} ${contact.last_name || ''}`.trim(),
      oldAppointmentDate: format(
        oldAppointmentEastern,
        'EEEE, MMMM d, yyyy',
        { timeZone: EASTERN_TIMEZONE }
      ),
      oldAppointmentTime: format(oldAppointmentEastern, 'h:mm a zzz', {
        timeZone: EASTERN_TIMEZONE,
      }),
      newAppointmentDate: format(
        newAppointmentEastern,
        'EEEE, MMMM d, yyyy',
        { timeZone: EASTERN_TIMEZONE }
      ),
      newAppointmentTime: format(newAppointmentEastern, 'h:mm a zzz', {
        timeZone: EASTERN_TIMEZONE,
      }),
      googleMeetLink:
        process.env.GOOGLE_MEET_LINK ||
        'https://meet.google.com/orb-dugk-cab',
      cancelToken: contact.uuid,
    });

    // Send both emails via Resend
    try {
      console.log('📧 Sending reschedule emails...');
      await Promise.all([
        sendEmail(
          resend,
          contact.email,
          'Your consultation has been rescheduled! 📅',
          clientEmailHtml
        ),
        sendEmail(
          resend,
          `${ADMIN_EMAIL}, kato@toastedsesametherapy.com`,
          `📅 Appointment Rescheduled - ${contact.name}`,
          adminEmailHtml
        ),
      ]);
      console.log('✅ Reschedule emails sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending reschedule emails:', emailError);
      // Don't throw - reschedule was successful even if email fails
    }

    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'appointment',
          title: 'Appointment Rescheduled',
          message: `${contact.name} rescheduled their consultation to ${format(newAppointmentEastern, 'MMM d, yyyy', { timeZone: EASTERN_TIMEZONE })}`,
          contact_id: contact.id,
          contact_name: `${contact.name} ${contact.last_name || ''}`.trim(),
          contact_email: contact.email,
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
      message: 'Appointment rescheduled successfully',
      contact: data[0],
      oldDateTime: oldAppointmentDate.toISOString(),
      newDateTime: newAppointmentUtc.toISOString(),
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
