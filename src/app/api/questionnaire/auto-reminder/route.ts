/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/questionnaire/auto-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getQuestionnaireReminderTemplate } from '@/lib/appointment-email-templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define reminder intervals in hours
const REMINDER_INTERVALS = {
  FIRST_REMINDER: 24,    // 1 day after creation
  SECOND_REMINDER: 48,   // 2 days after first reminder
  THIRD_REMINDER: 168    // 1 week after second reminder (7 days = 168 hours)
};

// Maximum number of reminders to send
const MAX_REMINDERS = 3;

// Function to send reminder email via Zapier
const sendReminderEmail = async (contact: any, reminderNumber: number) => {
  if (!process.env.ZAPIER_REMINDER_WEBHOOK_URL) {
    return false;
  }

  const questionnaireUrl = `${process.env.NEXT_PUBLIC_APP_URL}/questionnaire/${contact.questionnaire_token}`;

  // Customize subject based on reminder number
  const subjects = {
    1: 'Pick up where you left off 🌱 - Toasted Sesame Therapy',
    2: 'Still here when you\'re ready 💜 - Toasted Sesame Therapy',
    3: 'Final reminder: Your consultation is waiting ✨ - Toasted Sesame Therapy'
  };

  const emailData = {
    type: 'questionnaire_reminder',
    to: contact.email,
    subject: subjects[reminderNumber as keyof typeof subjects] || subjects[1],
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

// Helper function to calculate hours between two dates
const getHoursDifference = (date1: Date, date2: Date): number => {
  return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
};

// GET endpoint for automated reminders (called by cron)
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Optional: Add simple authentication for cron endpoint
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const results = {
      processed: 0,
      reminders_sent: 0,
      errors: 0,
      skipped: 0,
      details: [] as any[]
    };

    // Get all contacts who haven't completed questionnaire and have tokens
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('questionnaire_completed', false)
      .not('questionnaire_token', 'is', null)
      .not('name', 'is', null)
      .not('email', 'is', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching contacts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No contacts found that need reminders',
        ...results,
        execution_time_ms: Date.now() - startTime
      });
    }


    for (const contact of contacts) {
      results.processed++;

      const contactResult = {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        created_at: contact.created_at,
        current_reminder_count: contact.auto_reminder_count || 0,
        last_auto_reminder: contact.last_auto_reminder_sent,
        action: 'none',
        reason: '',
        success: false
      };

      try {
        const createdAt = new Date(contact.created_at);
        const reminderCount = contact.auto_reminder_count || 0;
        const lastReminderSent = contact.last_auto_reminder_sent
          ? new Date(contact.last_auto_reminder_sent)
          : null;

        // Skip if already sent maximum reminders
        if (reminderCount >= MAX_REMINDERS) {
          contactResult.action = 'skip';
          contactResult.reason = `Already sent ${MAX_REMINDERS} reminders`;
          results.skipped++;
          results.details.push(contactResult);
          continue;
        }

        let shouldSendReminder = false;
        let reminderNumber = 1;

        if (reminderCount === 0) {
          // First reminder: 24 hours after creation
          const hoursSinceCreated = getHoursDifference(createdAt, now);
          if (hoursSinceCreated >= REMINDER_INTERVALS.FIRST_REMINDER) {
            shouldSendReminder = true;
            reminderNumber = 1;
            contactResult.reason = `${hoursSinceCreated.toFixed(1)} hours since creation (>= 24h)`;
          } else {
            contactResult.reason = `Only ${hoursSinceCreated.toFixed(1)} hours since creation (< 24h)`;
          }
        } else if (reminderCount === 1 && lastReminderSent) {
          // Second reminder: 48 hours after first reminder
          const hoursSinceLastReminder = getHoursDifference(lastReminderSent, now);
          if (hoursSinceLastReminder >= REMINDER_INTERVALS.SECOND_REMINDER) {
            shouldSendReminder = true;
            reminderNumber = 2;
            contactResult.reason = `${hoursSinceLastReminder.toFixed(1)} hours since last reminder (>= 48h)`;
          } else {
            contactResult.reason = `Only ${hoursSinceLastReminder.toFixed(1)} hours since last reminder (< 48h)`;
          }
        } else if (reminderCount === 2 && lastReminderSent) {
          // Third reminder: 1 week after second reminder
          const hoursSinceLastReminder = getHoursDifference(lastReminderSent, now);
          if (hoursSinceLastReminder >= REMINDER_INTERVALS.THIRD_REMINDER) {
            shouldSendReminder = true;
            reminderNumber = 3;
            contactResult.reason = `${hoursSinceLastReminder.toFixed(1)} hours since last reminder (>= 168h/1 week)`;
          } else {
            contactResult.reason = `Only ${hoursSinceLastReminder.toFixed(1)} hours since last reminder (< 168h/1 week)`;
          }
        }

        if (shouldSendReminder) {
          contactResult.action = 'send_reminder';

          // Send the reminder email
          const emailSent = await sendReminderEmail(contact, reminderNumber);

          if (emailSent) {
            // Create the note text
            const noteText = `Questionnaire reminder #${reminderNumber} sent on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;

            // Prepare existing notes (if any) and append new note
            const existingNotes = contact.notes || '';
            const updatedNotes = existingNotes
              ? `${existingNotes}\n${noteText}`
              : noteText;

            // Update the contact record
            const { error: updateError } = await supabase
              .from('contacts')
              .update({
                auto_reminder_count: reminderCount + 1,
                last_auto_reminder_sent: now.toISOString(),
                // Also update the manual reminder field for backwards compatibility
                questionnaire_reminder_sent_at: now.toISOString(),
                // Update status and notes
                status: 'Reminder Sent',
                notes: updatedNotes
              })
              .eq('id', contact.id);

            // Create a notification entry for the dashboard
            if (!updateError) {
              const { error: notificationError } = await supabase
                .from('notifications')
                .insert({
                  type: 'reminder_sent',
                  title: 'Auto-Reminder Sent',
                  message: `Reminder #${reminderNumber} sent to ${contact.name}`,
                  contact_id: contact.id,
                  contact_name: contact.name,
                  contact_email: contact.email,
                  reminder_number: reminderNumber,
                  created_at: now.toISOString(),
                  read: false
                });

              if (notificationError) {
                console.error(`⚠️ Failed to create notification for contact ${contact.id}:`, notificationError);
                // Don't fail the whole process if notification creation fails
              }
            }

            if (updateError) {
              console.error(`❌ Failed to update contact ${contact.id}:`, updateError);
              contactResult.success = false;
              contactResult.reason += ' | Update failed';
              results.errors++;
            } else {
              contactResult.success = true;
              contactResult.reason += ' | Email sent & DB updated';
              results.reminders_sent++;
              console.log(`✅ Sent reminder #${reminderNumber} to ${contact.name} (${contact.email})`);
            }
          } else {
            contactResult.success = false;
            contactResult.reason += ' | Email failed';
            results.errors++;
          }
        } else {
          contactResult.action = 'skip';
          results.skipped++;
        }

      } catch (error) {
        console.error(`❌ Error processing contact ${contact.id}:`, error);
        contactResult.action = 'error';
        contactResult.success = false;
        contactResult.reason = `Processing error: ${error}`;
        results.errors++;
      }

      results.details.push(contactResult);
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} contacts, sent ${results.reminders_sent} reminders`,
      ...results,
      execution_time_ms: executionTime
    });

  } catch (error) {
    console.error('❌ Error in automated reminder system:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        execution_time_ms: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger (useful for testing)
export async function POST(request: NextRequest) {
  try {
    const { dryRun = false } = await request.json();

    if (dryRun) {
      // Dry run mode - just return what would be processed
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('id, name, email, created_at, auto_reminder_count, last_auto_reminder_sent, questionnaire_completed')
        .eq('questionnaire_completed', false)
        .not('questionnaire_token', 'is', null)
        .not('name', 'is', null)
        .not('email', 'is', null)
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
      }

      const now = new Date();
      const analysis = contacts?.map(contact => {
        const createdAt = new Date(contact.created_at);
        const reminderCount = contact.auto_reminder_count || 0;
        const lastReminderSent = contact.last_auto_reminder_sent
          ? new Date(contact.last_auto_reminder_sent)
          : null;

        const hoursSinceCreated = getHoursDifference(createdAt, now);
        const hoursSinceLastReminder = lastReminderSent
          ? getHoursDifference(lastReminderSent, now)
          : null;

        let wouldSend = false;
        let reason = '';

        if (reminderCount >= MAX_REMINDERS) {
          reason = `Already sent ${MAX_REMINDERS} reminders`;
        } else if (reminderCount === 0 && hoursSinceCreated >= REMINDER_INTERVALS.FIRST_REMINDER) {
          wouldSend = true;
          reason = `First reminder due (${hoursSinceCreated.toFixed(1)}h since creation)`;
        } else if (reminderCount === 1 && hoursSinceLastReminder && hoursSinceLastReminder >= REMINDER_INTERVALS.SECOND_REMINDER) {
          wouldSend = true;
          reason = `Second reminder due (${hoursSinceLastReminder.toFixed(1)}h since last)`;
        } else if (reminderCount === 2 && hoursSinceLastReminder && hoursSinceLastReminder >= REMINDER_INTERVALS.THIRD_REMINDER) {
          wouldSend = true;
          reason = `Third reminder due (${hoursSinceLastReminder.toFixed(1)}h since last)`;
        } else {
          reason = `Not due yet (count: ${reminderCount}, hours since created: ${hoursSinceCreated.toFixed(1)})`;
        }

        return {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          reminder_count: reminderCount,
          hours_since_created: hoursSinceCreated.toFixed(1),
          hours_since_last_reminder: hoursSinceLastReminder?.toFixed(1) || 'N/A',
          would_send_reminder: wouldSend,
          reason
        };
      }) || [];

      const wouldSendCount = analysis.filter(a => a.would_send_reminder).length;

      return NextResponse.json({
        dry_run: true,
        total_contacts: analysis.length,
        would_send_reminders: wouldSendCount,
        contacts: analysis
      });
    }

    // Not dry run - redirect to GET endpoint for actual processing
    return GET(request);

  } catch (error) {
    console.error('❌ Error in manual trigger:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
