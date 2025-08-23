import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, email, phone, appointmentDate, appointmentTime, variant, eventType } = body;
    
    if (!name || !email || !phone || !appointmentDate || !appointmentTime || !variant) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Zapier webhook URL from environment variables
    // Add ZAPIER_WEBHOOK_URL=your_zapier_webhook_url to .env.local
    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    
    if (!zapierWebhookUrl) {
      console.warn('ZAPIER_WEBHOOK_URL not configured - add to .env.local for email automation');
      return NextResponse.json(
        { message: 'Webhook not configured' },
        { status: 200 }
      );
    }

    // Prepare webhook payload
    const webhookPayload = {
      eventType,
      booking: {
        name,
        email,
        phone,
        appointmentDate,
        appointmentTime,
        variant,
        timestamp: new Date().toISOString(),
        source: 'booking_form'
      }
    };

    // Send to Zapier webhook
    const response = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook failed: ${response.status}`);
    }

    console.log('Zapier webhook sent successfully for:', email);
    
    return NextResponse.json(
      { message: 'Webhook sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Zapier webhook error:', error);
    
    return NextResponse.json(
      { error: 'Webhook failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}