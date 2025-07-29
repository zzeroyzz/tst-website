/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/leads/send-reminder/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCustomEmailWithRetry } from '@/lib/email-sender';
import { getContactWarmupTemplate } from '@/lib/custom-email-templates';

// Create admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mailchimpAudienceId = process.env.MAILCHIMP_LEAD_AUDIENCE_ID;

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  if (!mailchimpAudienceId) {
    return NextResponse.json({ error: 'Mailchimp Audience ID is not configured.' }, { status: 500 });
  }

  try {
    // 1. First, get the contact's name from the database
    console.log('Looking up contact:', email);
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('name, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (contactError || !contact) {
      console.error('Contact not found:', contactError);
      return NextResponse.json({
        error: 'Contact not found in database.'
      }, { status: 404 });
    }

    console.log('Found contact:', contact);

    // 2. Extract first name from full name
    const firstName = contact.name.split(' ')[0] || 'there';

    // 3. Send custom warmup email
    console.log('Sending warmup email...');
    const warmupHtml = getContactWarmupTemplate({
      name: firstName
    });

    const emailResult = await sendCustomEmailWithRetry({
      recipientEmail: email,
      recipientName: firstName,
      subject: 'Still interested in connecting? - Toasted Sesame Therapy',
      htmlContent: warmupHtml,
      listId: mailchimpAudienceId!,
      campaignTitle: `Contact Warmup - ${firstName} - ${new Date().toISOString()}`
    });

    if (!emailResult.success) {
      console.error('Failed to send warmup email:', emailResult.error);
      return NextResponse.json({
        error: 'Failed to send reminder email.',
        details: emailResult.error
      }, { status: 500 });
    }

    // 4. Update the contact's status in the database (optional)
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        status: 'Reminder Sent',
        reminder_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim());

    if (updateError) {
      console.error('Failed to update contact status:', updateError);
      // Don't fail the request for this, just log it
    }

    console.log('Warmup email sent successfully!');

    return NextResponse.json({
      message: 'Reminder email sent successfully!',
      contactName: firstName,
      emailSent: true
    }, { status: 200 });

  } catch (error: any) {
    console.error('Send reminder error:', error);
    const errorMessage = error.message || 'Failed to send reminder email.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
