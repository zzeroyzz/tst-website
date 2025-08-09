// src/app/api/contact/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendCustomEmailWithRetry } from '@/lib/email-sender';
import { getContactConfirmationTemplate } from '@/lib/custom-email-templates';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { name, email, phone } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  try {
    // 1. Check if contact already exists
    const { data: existingContact, error: checkError } = await supabase
      .from('contacts')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single();

    if (existingContact) {
      return NextResponse.json({
        error: 'An account with this email already exists. Please contact care@toastedsesametherapy.com directly for assistance.',
        contactExists: true
      }, { status: 409 }); // 409 Conflict status code
    }

    // If checkError is not "no rows returned", then it's a real error
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError);
      throw new Error('Failed to check existing contacts');
    }

    // Generate secure token for questionnaire
    const questionnaireToken = randomUUID();

    // 2. Save new contact to database
    const { data: newContact, error: dbError } = await supabase
      .from('contacts')
      .insert([{
        name,
        email: email.toLowerCase(), // Normalize email to lowercase
        phone,
        questionnaire_token: questionnaireToken,
        questionnaire_completed: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);

      // Handle unique constraint violation (duplicate email)
      if (dbError.code === '23505') {
        return NextResponse.json({
          error: 'An account with this email already exists. Please contact care@toastedsesametherapy.com directly for assistance.',
          contactExists: true
        }, { status: 409 });
      }

      throw new Error('Failed to save contact');
    }

    // 3. Send confirmation email
    try {
      const emailTemplate = getContactConfirmationTemplate({ name });
      await sendCustomEmailWithRetry({
        to: email,
        subject: 'Thanks for reaching out! Next steps inside 📝',
        html: emailTemplate
      });
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the entire request if email fails
    }

    // 4. Return success with questionnaire token for redirect
    return NextResponse.json({
      message: 'Contact saved successfully!',
      questionnaireToken: questionnaireToken,
      contactId: newContact.id
    }, { status: 200 });

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred. Please try again or contact care@toastedsesametherapy.com for assistance.'
    }, { status: 500 });
  }
}
