// src/app/api/contacts/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const upcoming = searchParams.get('upcoming') === 'true';

    let query = supabase
      .from('contacts')
      .select('*')
      .not('scheduled_appointment_at', 'is', null)
      .order('scheduled_appointment_at', { ascending: true });

    // Filter by appointment status
    if (status) {
      query = query.eq('appointment_status', status);
    }

    // Filter for upcoming appointments only
    if (upcoming) {
      const now = new Date().toISOString();
      query = query.gte('scheduled_appointment_at', now);
    }

    // Apply limit
    query = query.limit(limit);

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Failed to fetch appointments', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      appointments: appointments || [],
      count: appointments?.length || 0
    });

  } catch (error) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
