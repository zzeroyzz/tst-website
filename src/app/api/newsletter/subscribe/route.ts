// src/app/api/newsletter/subscribe/route.ts
import { NextResponse } from 'next/server';

const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
const mailchimpAudienceId = process.env.MAILCHIMP_NEWSLETTER_AUDIENCE_ID;

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    // Check environment variables
    if (!mailchimpApiKey || !mailchimpServerPrefix || !mailchimpAudienceId) {
      console.error('Missing Mailchimp environment variables:', {
        apiKey: !!mailchimpApiKey,
        serverPrefix: !!mailchimpServerPrefix,
        audienceId: !!mailchimpAudienceId
      });
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const mailchimpUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`;

    // Parse name more robustly
    const nameParts = name?.trim() ? name.trim().split(' ') : [];
    const FNAME = nameParts[0] || '';
    const LNAME = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const mailchimpData = {
      email_address: email.toLowerCase().trim(),
      status: 'subscribed', // This will trigger the automation
      merge_fields: {
        FNAME: FNAME,
        LNAME: LNAME,
      },
      tags: ['newsletter-signup'], // Make sure this matches your automation trigger
      // Optional: Add double opt-in if required
      // status: 'pending', // Use this if you want double opt-in
    };

    console.log('Attempting to subscribe:', email, 'to list:', mailchimpAudienceId);

    const response = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailchimpData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Handle different types of errors
      if (responseData.title === 'Member Exists') {
        console.log('Member already exists:', email);

        // Try to update the existing member to ensure they're subscribed
        const updateUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members/${Buffer.from(email.toLowerCase()).toString('base64').replace(/=/g, '')}`;

        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `apikey ${mailchimpApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'subscribed',
            merge_fields: {
              FNAME: FNAME,
              LNAME: LNAME,
            },
          }),
        });

        if (updateResponse.ok) {
          return NextResponse.json({
            message: 'Successfully updated subscription!',
            status: 'updated'
          }, { status: 200 });
        }
      }

      console.error('Mailchimp API Error:', responseData);
      return NextResponse.json({
        error: `Subscription failed: ${responseData.detail || responseData.title}`
      }, { status: 400 });
    }

    console.log('Successfully subscribed:', email, 'Response:', responseData);

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter!',
      status: 'subscribed',
      id: responseData.id
    }, { status: 200 });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
