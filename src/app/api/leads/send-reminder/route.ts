/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/leads/send-reminder/route.ts
import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

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
    // Mailchimp requires the subscriber hash, which is the MD5 hash of the lowercase email address.
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    // Add the 'reminder-follow-up' tag to the contact.
    // This tag will trigger the new Customer Journey you create in Mailchimp.
    await mailchimp.lists.updateListMemberTags(
      mailchimpAudienceId,
      subscriberHash,
      {
        tags: [{ name: 'reminder-follow-up', status: 'active' }]
      }
    );

    return NextResponse.json({ message: 'Reminder successfully sent!' }, { status: 200 });

  } catch (error: any) {
    console.error('Mailchimp API Error:', error.response?.body || error.message);
    const errorMessage = error.response?.body?.detail || 'Failed to send reminder. The contact may not exist in Mailchimp.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
