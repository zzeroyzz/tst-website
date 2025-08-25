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
    const { data: updatedContacts, error: contactsError } = await supabase
      .from('contacts')
      .update({
        appointment_status: 'COMPLETED',
        last_appointment_update: now.toISOString(),
        appointment_notes: supabase.raw(`COALESCE(appointment_notes, '') || ' | Auto-completed by system'`)
      })
      .lt('scheduled_appointment_at', oneHourAgo.toISOString())
      .eq('appointment_status', 'SCHEDULED')
      .select('id, name, email, scheduled_appointment_at');

    if (contactsError) {
      console.error('[cleanup-past] Error updating contacts:', contactsError);
      return NextResponse.json(
        { error: 'Failed to update contacts', details: contactsError.message },
        { status: 500 }
      );
    }

    // Update leads table - mark past scheduled appointments as completed
    const { data: updatedLeads, error: leadsError } = await supabase
      .from('leads')
      .update({
        appointment_status: 'COMPLETED',
        appointment_notes: supabase.raw(`COALESCE(appointment_notes, '') || ' | Auto-completed by system'`)
      })
      .lt('scheduled_appointment_at', oneHourAgo.toISOString())
      .eq('appointment_status', 'SCHEDULED')
      .select('id, name, email, scheduled_appointment_at');

    if (leadsError) {
      console.error('[cleanup-past] Error updating leads:', leadsError);
      return NextResponse.json(
        { error: 'Failed to update leads', details: leadsError.message },
        { status: 500 }
      );
    }

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
  return POST(new Request('http://localhost/api/appointment/cleanup-past', { method: 'POST' }));
}