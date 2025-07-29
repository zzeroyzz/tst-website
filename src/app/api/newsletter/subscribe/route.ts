// src/app/api/newsletter/subscribe/route.ts - Updated
import { NextResponse } from 'next/server';
import { sendCustomEmailWithRetry } from '@/lib/email-sender';
import { getWelcomeEmailTemplate } from '@/lib/custom-email-templates';

const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
const mailchimpAudienceId = process.env.MAILCHIMP_NEWSLETTER_AUDIENCE_ID;

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    // Extract username from email (everything before @)
    const emailUsername = email.split('@')[0];

    const nameParts = name?.trim() ? name.trim().split(' ') : [];
    const FNAME = nameParts[0] || '';
    const LNAME = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // 1. Add to Mailchimp audience (for analytics, NO automation)
    const mailchimpUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`;
    const mailchimpData = {
      email_address: email.toLowerCase().trim(),
      status: 'subscribed',
      merge_fields: { FNAME, LNAME },
      tags: ['newsletter-signup-v2'], // Keep for tracking, but turn OFF automation
    };

    // console.log('Adding subscriber to Mailchimp...');
    const response = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${mailchimpApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailchimpData),
    });

    const responseData = await response.json();

    // Handle existing subscriber
    if (!response.ok && responseData.title === 'Member Exists') {
      // console.log('Subscriber already exists, updating...');
      // Update existing subscriber
      const subscriberHash = Buffer.from(email.toLowerCase()).toString('base64').replace(/=/g, '');
      const updateUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members/${subscriberHash}`;

      await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `apikey ${mailchimpApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'subscribed',
          merge_fields: { FNAME, LNAME },
        }),
      });
    } else if (!response.ok) {
      console.error('Mailchimp API Error:', responseData);
      return NextResponse.json({
        error: `Subscription failed: ${responseData.detail || responseData.title}`
      }, { status: 400 });
    }

    // 2. Send custom welcome email using your beautiful template
    // console.log('Sending custom welcome email...');

    const welcomeHtml = getWelcomeEmailTemplate({
      name: emailUsername || 'friend'
    });

    const emailResult = await sendCustomEmailWithRetry({
      recipientEmail: email,
      recipientName: FNAME,
      subject: 'Welcome! Your free guides are here ☁️',
      htmlContent: welcomeHtml,
      listId: mailchimpAudienceId!,
      campaignTitle: `New Subscriber Email - ${emailUsername || 'subscriber'} - ${new Date().toISOString()}`
    });

    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error);
      // Don't fail the subscription, but log the issue
    } else {
      console.log('Welcome email sent successfully!');
    }

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter!',
      status: 'subscribed',
      emailSent: emailResult.success
    }, { status: 200 });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
