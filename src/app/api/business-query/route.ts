/**
 * API route for business query email sending
 * Uses Resend to send business inquiries to kato@toastedsesametherapy.com
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Toasted Sesame <kato@toastedsesametherapy.com>';
const BUSINESS_EMAIL = 'kato@toastedsesametherapy.com';

interface BusinessQueryRequest {
  name: string;
  email: string;
  phone: string;
  queryType: string;
}

function getBusinessQueryEmailTemplate(data: BusinessQueryRequest): string {
  const { name, email, phone, queryType } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #F9F5F2; border: 2px solid #000; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
        <h1 style="color: #000; margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">New Business Query</h1>
        
        <div style="background-color: #F7BD01; border: 2px solid #000; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #000;">Query Type: ${queryType}</h2>
        </div>

        <div style="background-color: #fff; border: 2px solid #000; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 15px 0; color: #000; font-size: 18px;">Contact Information</h3>
          <p style="margin: 5px 0; font-size: 16px; color: #000;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 5px 0; font-size: 16px; color: #000;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0; font-size: 16px; color: #000;"><strong>Phone:</strong> ${phone}</p>
        </div>

        <div style="background-color: #C5A1FF; border: 2px solid #000; border-radius: 8px; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #000;">
            This business query was submitted on ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'America/New_York',
              timeZoneName: 'short'
            })}
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const body: BusinessQueryRequest = await request.json();
    const { name, email, phone, queryType } = body;

    if (!name || !email || !phone || !queryType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resend = new Resend(RESEND_API_KEY);

    const html = getBusinessQueryEmailTemplate({ name, email, phone, queryType });
    const subject = `Business Query: ${queryType} - ${name}`;

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: BUSINESS_EMAIL,
      subject,
      html,
    });

    if ((result as any)?.error) {
      console.error('❌ Failed to send business query email:', (result as any).error);
      return NextResponse.json(
        { error: `Failed to send email: ${JSON.stringify((result as any).error)}` }, 
        { status: 500 }
      );
    }

    console.log('✅ Business query email sent successfully:', { name, email, queryType });

    return NextResponse.json({ success: true, message: 'Business query submitted successfully' });

  } catch (error) {
    console.error('Failed to send business query email:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function PUT() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function DELETE() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}