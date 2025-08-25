// src/app/api/appointment/booked-slots/route.ts
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

    if (!isIsoString(startDate) || !isIsoString(endDate)) {
      return NextResponse.json(
        { error: 'startDate and endDate must be valid ISO strings' },
        { status: 400 }
      );
    }

    // Query contacts table for all scheduled appointments
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id, uuid, scheduled_appointment_at, appointment_status')
      .gte('scheduled_appointment_at', startDate)
      .lte('scheduled_appointment_at', endDate)
      .not('scheduled_appointment_at', 'is', null)
      .eq('appointment_status', 'SCHEDULED')
      .order('scheduled_appointment_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch booked slots' },
        { status: 500 }
      );
    }

    // Convert to booked slots
    const bookedSlots = (contacts || []).map(row => {
      const start = new Date(row.scheduled_appointment_at as string);
      const end = new Date(start);

      // Default to 50min therapy session
      end.setMinutes(end.getMinutes() + 50);

      return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        contactId: row.uuid, // use UUID for consistency
        type: 'therapy_session',
      };
    });

    return NextResponse.json({
      bookedSlots: bookedSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
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
