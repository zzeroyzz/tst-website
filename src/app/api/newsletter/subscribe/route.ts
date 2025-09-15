// src/app/api/newsletter/subscribe/route.ts - Updated to use Resend
import { NextResponse } from 'next/server';
import { sendCustomEmailWithRetry, addSubscriberToAudience, updateSubscriberInAudience } from '@/lib/resend-email-sender';
import { getWelcomeEmailTemplate } from '@/lib/custom-email-templates';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    // Extract username from email (everything before @)
    const emailUsername = email.split('@')[0];

    const nameParts = name?.trim() ? name.trim().split(' ') : [];
    const FNAME = nameParts[0] || '';
    const LNAME = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // 1. Add to Resend audience
    const subscriberData = {
      email: email.toLowerCase().trim(),
      firstName: FNAME,
      lastName: LNAME,
      unsubscribed: false,
    };

    let subscriberResult = await addSubscriberToAudience(subscriberData);

    // If subscriber already exists, try to update instead
    if (!subscriberResult.success && (
      subscriberResult.error?.includes('already exists') || 
      subscriberResult.error?.includes('Contact already exists') ||
      subscriberResult.error?.includes('already exists in the audience')
    )) {
      // Contact already exists, attempting to update
      subscriberResult = await updateSubscriberInAudience(email.toLowerCase().trim(), {
        firstName: FNAME,
        lastName: LNAME,
        unsubscribed: false,
      });
    }

    if (!subscriberResult.success) {
      console.error('Resend API Error:', subscriberResult.error);
      return NextResponse.json(
        {
          error: `Subscription failed: ${subscriberResult.error}`,
        },
        { status: 400 }
      );
    }

    // 2. Send custom welcome email using your beautiful template

    const welcomeHtml = getWelcomeEmailTemplate({
      name: emailUsername || 'friend',
    });

    const emailResult = await sendCustomEmailWithRetry({
      recipientEmail: email,
      recipientName: FNAME,
      subject: 'Welcome! Your free guides are here ☁️',
      htmlContent: welcomeHtml,
    });

    if (!emailResult.success) {
      return;
    }
    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter!',
        status: 'subscribed',
        emailSent: emailResult.success,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
