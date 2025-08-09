// src/app/api/appointment/booked-slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APPOINTMENT_MINUTES = 50;

function isIsoString(v: unknown): v is string {
  return typeof v === 'string' && !Number.isNaN(Date.parse(v));
}

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    // Expect ISO strings (UTC). Example: "2025-08-01T00:00:00.000Z"
    if (!isIsoString(startDate) || !isIsoString(endDate)) {
      return NextResponse.json(
        { error: 'startDate and endDate must be valid ISO strings' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('contacts')
      .select('id, scheduled_appointment_at, appointment_status')
      .gte('scheduled_appointment_at', startDate)
      .lte('scheduled_appointment_at', endDate)
      .not('scheduled_appointment_at', 'is', null)
      .neq('appointment_status', 'cancelled') // exclude cancelled
      .order('scheduled_appointment_at', { ascending: true });

    if (error) {
      console.error('[booked-slots][POST] supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch booked slots' },
        { status: 500 }
      );
    }

    // scheduled_appointment_at is timestamptz → parse directly to Date (UTC instant)
    const bookedSlots = (data ?? []).map((row) => {
      const start = new Date(row.scheduled_appointment_at as string);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + APPOINTMENT_MINUTES);

      return {
        startTime: start.toISOString(), // keep UTC in API
        endTime: end.toISOString(),
        contactId: row.id,
      };
    });

    return NextResponse.json({
      bookedSlots,
      count: bookedSlots.length,
    });
  } catch (err) {
    console.error('[booked-slots][POST] unhandled error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const { data, error } = await supabase
      .from('contacts')
      .select('id, scheduled_appointment_at, appointment_status')
      .gte('scheduled_appointment_at', start.toISOString())
      .lte('scheduled_appointment_at', end.toISOString())
      .not('scheduled_appointment_at', 'is', null)
      .neq('appointment_status', 'cancelled')
      .order('scheduled_appointment_at', { ascending: true });

    if (error) {
      console.error('[booked-slots][GET] supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch booked slots' },
        { status: 500 }
      );
    }

    const bookedSlots = (data ?? []).map((row) => {
      const s = new Date(row.scheduled_appointment_at as string);
      const e = new Date(s);
      e.setMinutes(e.getMinutes() + APPOINTMENT_MINUTES);
      return {
        startTime: s.toISOString(),
        endTime: e.toISOString(),
        contactId: row.id,
      };
    });

    return NextResponse.json({
      bookedSlots,
      count: bookedSlots.length,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
    });
  } catch (err) {
    console.error('[booked-slots][GET] unhandled error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
