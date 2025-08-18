/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/questionnaire/reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getQuestionnaireReminderTemplate } from '@/lib/appointment-email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to send reminder email via Zapier
const sendReminderEmail = async (contact: any) => {
  if (!process.env.ZAPIER_REMINDER_WEBHOOK_URL) {
    console.log('No Zapier reminder webhook URL configured');
    return false;
  }

  const questionnaireUrl = `${process.env.NEXT_PUBLIC_APP_URL}/questionnaire/${contact.questionnaire_token}`;

  const emailData = {
    type: 'questionnaire_reminder',
    to: contact.email,
    subject: 'Pick up where you left off 🌱 - Toasted Sesame Therapy',
    html: getQuestionnaireReminderTemplate({
      name: contact.name,
      questionnaireUrl: questionnaireUrl
    })
  };

  try {

    const response = await fetch(process.env.ZAPIER_REMINDER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Zapier webhook failed:', response.status, response.statusText, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error);
    return false;
  }
};

// POST - Send reminder to specific contact by ID
export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();
    console.log('🔍 Processing reminder request for contact ID:', contactId);

    if (!contactId) {
      console.log('❌ No contact ID provided');
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Get the contact details
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (fetchError || !contact) {
      console.error('❌ Error finding contact:', fetchError);
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }


    // Check if contact has already completed questionnaire
    if (contact.questionnaire_completed) {
      return NextResponse.json(
        { error: 'Contact has already completed the questionnaire' },
        { status: 400 }
      );
    }

    // Check if contact has a questionnaire token
    if (!contact.questionnaire_token) {
      return NextResponse.json(
        { error: 'Contact does not have a questionnaire token' },
        { status: 400 }
      );
    }

    // Validate that we have the minimum required data for the email template
    if (!contact.name || !contact.email) {
      console.log('❌ Contact missing name or email:', {
        hasName: !!contact.name,
        hasEmail: !!contact.email
      });
      return NextResponse.json(
        { error: 'Contact must have name and email to send reminder' },
        { status: 400 }
      );
    }

    console.log('✅ All validations passed, sending reminder email...');

    // Send the reminder email
    const emailSent = await sendReminderEmail(contact);

    if (!emailSent) {
      console.log('❌ Failed to send reminder email');
      return NextResponse.json(
        { error: 'Failed to send reminder email' },
        { status: 500 }
      );
    }

    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          type: 'reminder_sent',
          title: 'Manual Reminder Sent',
          message: `Manual reminder sent to ${contact.name}`,
          contact_id: contact.id,
          contact_name: contact.name,
          contact_email: contact.email,
          reminder_number: 1, // Manual reminders are always "1"
          read: false,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('Failed to create manual reminder notification:', notificationError);
      }
    } catch (notificationError) {
      console.error('Failed to create manual reminder notification:', notificationError);
  }

    return NextResponse.json({
      success: true,
      message: 'Reminder email sent successfully',
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email
      }
    });

  } catch (error) {
    console.error('❌ Error in reminder API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
