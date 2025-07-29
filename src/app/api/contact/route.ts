import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendCustomEmailWithRetry } from '@/lib/email-sender';
import { getContactConfirmationTemplate } from '@/lib/custom-email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
const mailchimpAudienceId = process.env.MAILCHIMP_LEAD_AUDIENCE_ID;

export async function POST(request: Request) {
  const { name, email, phone } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  try {
    // 1. Save to database
    await supabase.from('contacts').insert([{ name, email, phone }]);

    // 2. Add to Mailchimp leads audience (for analytics, NO automation)
    const nameParts = name.split(' ');
    const FNAME = nameParts[0];
    const LNAME = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const mailchimpUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`;
    const mailchimpData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: { FNAME, LNAME, PHONE: phone },
      tags: ["leads-v2"] // Keep for tracking, but turn OFF automation
    };

    // console.log('Adding lead to Mailchimp...');
    const response = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailchimpData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.title !== 'Member Exists') {
        throw new Error(`Mailchimp API Error: ${errorData.detail}`);
      }
    }

    // 3. Send custom confirmation email using your beautiful template
    // console.log('Sending custom confirmation email...');

    const confirmationHtml = getContactConfirmationTemplate({
      name: FNAME
    });

    const emailResult = await sendCustomEmailWithRetry({
      recipientEmail: email,
      recipientName: FNAME,
      subject: 'Thank you for reaching out - Toasted Sesame Therapy',
      htmlContent: confirmationHtml,
      listId: mailchimpAudienceId!,
      campaignTitle: `Contact Confirmation - ${FNAME} - ${new Date().toISOString()}`
    });

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
      // Don't fail the contact submission, but log the issue
    } else {
      // console.log('Confirmation email sent successfully!');
    }

    return NextResponse.json({
      message: 'Successfully submitted!',
      emailSent: emailResult.success
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
