// src/app/api/appointment/cleanup-past/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000)); // 1 hour buffer

    // Update contacts table - mark past scheduled appointments as completed
    // First get the contacts to update their notes properly
    const { data: contactsToUpdate, error: fetchContactsError } = await supabase
      .from('contacts')
      .select('id, name, email, scheduled_appointment_at, appointment_notes')
      .lt('scheduled_appointment_at', oneHourAgo.toISOString())
      .eq('appointment_status', 'SCHEDULED');

    if (fetchContactsError) {
      console.error('[cleanup-past] Error fetching contacts:', fetchContactsError);
      return NextResponse.json(
        { error: 'Failed to fetch contacts for cleanup', details: fetchContactsError.message },
        { status: 500 }
      );
    }

    let updatedContacts: any[] = [];
    if (contactsToUpdate && contactsToUpdate.length > 0) {
      // Update each contact with proper note concatenation
      for (const contact of contactsToUpdate) {
        const updatedNote = contact.appointment_notes 
          ? `${contact.appointment_notes} | Auto-completed by system`
          : 'Auto-completed by system';
        
        const { data, error } = await supabase
          .from('contacts')
          .update({
            appointment_status: 'COMPLETED',
            last_appointment_update: now.toISOString(),
            appointment_notes: updatedNote
          })
          .eq('id', contact.id)
          .select('id, name, email, scheduled_appointment_at');

        if (error) {
          console.error('[cleanup-past] Error updating contact:', contact.id, error);
          continue;
        }
        if (data) {
          updatedContacts.push(...data);
        }
      }
    }

    // No error handling needed here since we handle errors individually above

    // Update leads table - mark past scheduled appointments as completed
    // First get the leads to update their notes properly
    const { data: leadsToUpdate, error: fetchLeadsError } = await supabase
      .from('leads')
      .select('id, name, email, scheduled_appointment_at, appointment_notes')
      .lt('scheduled_appointment_at', oneHourAgo.toISOString())
      .eq('appointment_status', 'SCHEDULED');

    if (fetchLeadsError) {
      console.error('[cleanup-past] Error fetching leads:', fetchLeadsError);
      return NextResponse.json(
        { error: 'Failed to fetch leads for cleanup', details: fetchLeadsError.message },
        { status: 500 }
      );
    }

    let updatedLeads: any[] = [];
    if (leadsToUpdate && leadsToUpdate.length > 0) {
      // Update each lead with proper note concatenation
      for (const lead of leadsToUpdate) {
        const updatedNote = lead.appointment_notes 
          ? `${lead.appointment_notes} | Auto-completed by system`
          : 'Auto-completed by system';
        
        const { data, error } = await supabase
          .from('leads')
          .update({
            appointment_status: 'COMPLETED',
            appointment_notes: updatedNote
          })
          .eq('id', lead.id)
          .select('id, name, email, scheduled_appointment_at');

        if (error) {
          console.error('[cleanup-past] Error updating lead:', lead.id, error);
          continue;
        }
        if (data) {
          updatedLeads.push(...data);
        }
      }
    }

    // No error handling needed here since we handle errors individually above

    const totalUpdated = (updatedContacts?.length || 0) + (updatedLeads?.length || 0);
    
    // Create notifications for significant cleanups
    if (totalUpdated > 0) {
      try {
        await supabase.from('notifications').insert({
          type: 'system',
          title: 'Past Appointments Auto-Completed',
          message: `System automatically marked ${totalUpdated} past appointments as completed`,
          read: false,
          created_at: now.toISOString(),
        });
      } catch (notificationError) {
        console.warn('[cleanup-past] Failed to create notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      updated: totalUpdated,
      contacts: updatedContacts?.length || 0,
      leads: updatedLeads?.length || 0,
      cutoffTime: oneHourAgo.toISOString(),
      updatedAppointments: [
        ...(updatedContacts || []).map(c => ({ 
          type: 'contact', 
          id: c.id, 
          name: c.name, 
          email: c.email,
          scheduledAt: c.scheduled_appointment_at 
        })),
        ...(updatedLeads || []).map(l => ({ 
          type: 'lead', 
          id: l.id, 
          name: l.name, 
          email: l.email,
          scheduledAt: l.scheduled_appointment_at 
        }))
      ]
    });

  } catch (error) {
    console.error('[cleanup-past] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET() {
  const request = new NextRequest('http://localhost/api/appointment/cleanup-past', { method: 'POST' });
  return POST(request);
}