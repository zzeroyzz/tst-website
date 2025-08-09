/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/questionnaire/remind/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendCustomEmailWithRetry } from '@/lib/email-sender';
import { getQuestionnaireReminderTemplate } from '@/lib/custom-email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mailchimpAudienceId = process.env.MAILCHIMP_LEAD_AUDIENCE_ID;

export async function POST(request: Request) {
  try {
    // Find contacts who:
    // 1. Haven't completed questionnaire
    // 2. Were created more than 48 hours ago
    // 3. Haven't been sent a reminder yet
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: incompleteContacts, error } = await supabase
      .from('contacts')
      .select('id, name, email, questionnaire_token, created_at')
      .eq('questionnaire_completed', false)
      .lt('created_at', fortyEightHoursAgo)
      .is('questionnaire_reminder_sent_at', null);

    if (error) {
      console.error('Error fetching incomplete contacts:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!incompleteContacts || incompleteContacts.length === 0) {
      return NextResponse.json({
        message: 'No contacts need reminders at this time',
        processed: 0
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each contact
    for (const contact of incompleteContacts) {
      try {
        const firstName = contact.name.split(' ')[0] || 'there';

        // Create reminder email with questionnaire link
        const reminderHtml = getQuestionnaireReminderTemplate({
          name: firstName,
          questionnaireUrl: `${process.env.NEXTAUTH_URL || 'https://toastedsesametherapy.com'}/questionnaire/${contact.questionnaire_token}`
        });

        // Send reminder email
        const emailResult = await sendCustomEmailWithRetry({
          recipientEmail: contact.email,
          recipientName: firstName,
          subject: 'Complete your information - Toasted Sesame Therapy',
          htmlContent: reminderHtml,
          listId: mailchimpAudienceId!,
          campaignTitle: `Questionnaire Reminder - ${firstName} - ${new Date().toISOString()}`
        });

        if (emailResult.success) {
          // Update the contact to mark reminder as sent
          await supabase
            .from('contacts')
            .update({
              questionnaire_reminder_sent_at: new Date().toISOString()
            })
            .eq('id', contact.id);

          successCount++;
          results.push({
            contactId: contact.id,
            email: contact.email,
            status: 'success'
          });
        } else {
          errorCount++;
          results.push({
            contactId: contact.id,
            email: contact.email,
            status: 'failed',
            error: emailResult.error
          });
        }

      } catch (contactError) {
        console.error(`Error processing contact ${contact.id}:`, contactError);
        errorCount++;
        results.push({
          contactId: contact.id,
          email: contact.email,
          status: 'failed',
          error: 'Processing error'
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${incompleteContacts.length} reminder(s)`,
      processed: incompleteContacts.length,
      successful: successCount,
      failed: errorCount,
      results
    });

  } catch (error) {
    console.error('Questionnaire reminder job error:', error);
    return NextResponse.json({
      error: 'Failed to process reminders'
    }, { status: 500 });
  }
}
