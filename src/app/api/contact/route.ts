import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
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
    await supabase.from('contacts').insert([{ name, email, phone }]);

    const mailchimpUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`;

    const nameParts = name.split(' ');
    const FNAME = nameParts[0];
    const LNAME = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const mailchimpData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: FNAME,
        LNAME: LNAME,
        PHONE: phone,
      },
      tags: ["leads"] // <-- This is the updated tag
    };

    // Send data to Mailchimp
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

    return NextResponse.json({ message: 'Successfully submitted!' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
