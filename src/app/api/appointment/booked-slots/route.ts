// src/app/api/appointment/booked-slots/route.ts (Updated to include leads table)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isIsoString(v: unknown): v is string {
  return typeof v === 'string' && !Number.isNaN(Date.parse(v));
}

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    // Expect ISO strings (UTC)
    if (!isIsoString(startDate) || !isIsoString(endDate)) {
      return NextResponse.json(
        { error: 'startDate and endDate must be valid ISO strings' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Query contacts table for regular appointments (50-minute sessions)
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, scheduled_appointment_at, appointment_status')
      .gte('scheduled_appointment_at', startDate)
      .lte('scheduled_appointment_at', endDate)
      .not('scheduled_appointment_at', 'is', null)
      .neq('appointment_status', 'cancelled')
      .order('scheduled_appointment_at', { ascending: true });

    // Query leads table for grounding sessions (15-minute sessions)
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, appointment_date, appointment_time, lead_status')
      .gte('appointment_date', start.toISOString().split('T')[0])
      .lte('appointment_date', end.toISOString().split('T')[0])
      .not('appointment_date', 'is', null)
      .not('appointment_time', 'is', null)
      .eq('lead_status', 'scheduled')
      .order('appointment_date', { ascending: true });

    if (contactsError || leadsError) {
      console.error('Database error:', contactsError || leadsError);
      return NextResponse.json(
        { error: 'Failed to fetch booked slots' },
        { status: 500 }
      );
    }

    // Convert contacts to booked slots (50-minute appointments)
    const contactSlots = (contacts || []).map(row => {
      const start = new Date(row.scheduled_appointment_at as string);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 50); // 50-minute therapy sessions

      return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        contactId: row.id,
        type: 'therapy_session',
      };
    });

    // Convert leads to booked slots (15-minute grounding sessions)
    const leadSlots = (leads || []).map(row => {
      const start = new Date(
        `${row.appointment_date}T${row.appointment_time}Z`
      );
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 15); // 15-minute grounding sessions

      return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        contactId: row.id,
        type: 'grounding_session',
      };
    });

    // Combine both types of appointments
    const bookedSlots = [...contactSlots, ...leadSlots].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return NextResponse.json({
      bookedSlots: bookedSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })), // Return format expected by LeadCalendar
      count: bookedSlots.length,
      dateRange: { start: startDate, end: endDate },
    });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booked slots' },
      { status: 500 }
    );
  }
}

// Optional GET for quick testing of the next 30 days
export async function GET() {
  try {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);

    const [{ data: contacts }, { data: leads }] = await Promise.all([
      supabase
        .from('contacts')
        .select('id, scheduled_appointment_at, appointment_status')
        .gte('scheduled_appointment_at', start.toISOString())
        .lte('scheduled_appointment_at', end.toISOString())
        .not('scheduled_appointment_at', 'is', null)
        .neq('appointment_status', 'cancelled')
        .order('scheduled_appointment_at', { ascending: true }),
      supabase
        .from('leads')
        .select('id, appointment_date, appointment_time, lead_status')
        .gte('appointment_date', start.toISOString().split('T')[0])
        .lte('appointment_date', end.toISOString().split('T')[0])
        .not('appointment_date', 'is', null)
        .not('appointment_time', 'is', null)
        .eq('lead_status', 'scheduled')
        .order('appointment_date', { ascending: true }),
    ]);

    const contactSlots = (contacts || []).map(row => {
      const s = new Date(row.scheduled_appointment_at as string);
      const e = new Date(s);
      e.setMinutes(e.getMinutes() + 50);
      return {
        startTime: s.toISOString(),
        endTime: e.toISOString(),
        contactId: row.id,
        type: 'therapy_session',
      };
    });

    const leadSlots = (leads || []).map(row => {
      const s = new Date(`${row.appointment_date}T${row.appointment_time}Z`);
      const e = new Date(s);
      e.setMinutes(e.getMinutes() + 15);
      return {
        startTime: s.toISOString(),
        endTime: e.toISOString(),
        contactId: row.id,
        type: 'grounding_session',
      };
    });

    const bookedSlots = [...contactSlots, ...leadSlots].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return NextResponse.json({
      bookedSlots: bookedSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
      count: bookedSlots.length,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
    });
  } catch (err) {
    console.error('Error in GET /booked-slots:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
