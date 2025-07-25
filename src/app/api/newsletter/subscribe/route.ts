// src/app/api/newsletter/subscribe/route.ts
import { NextResponse } from 'next/server';

const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
const mailchimpAudienceId = process.env.MAILCHIMP_NEWSLETTER_AUDIENCE_ID; // Use the correct Audience ID

export async function POST(request: Request) {
  const { email, name } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  if (!mailchimpAudienceId) {
    console.error('MAILCHIMP_NEWSLETTER_AUDIENCE_ID is not set in environment variables.');
    return NextResponse.json({ error: 'Audience ID is not configured.' }, { status: 500 });
  }

  try {
    const mailchimpUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`;

    const nameParts = name ? name.split(' ') : ['Newsletter', 'Subscriber'];
    const FNAME = nameParts[0];
    const LNAME = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const mailchimpData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: FNAME,
        LNAME: LNAME,
      },
      tags: ["newsletter-signup"] // A specific tag for newsletter signups
    };

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
      // Ignore "Member Exists" error, but throw others
      if (errorData.title !== 'Member Exists') {
        throw new Error(`Mailchimp API Error: ${errorData.detail}`);
      }
    }

    return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 200 });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
