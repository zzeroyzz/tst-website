// src/app/api/contact/cancel-appointment/route.ts
//CLIENT-FACING PAGE
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();

    if (!contactId) {
      return NextResponse.json(
        { message: 'Missing required field: contactId' },
        { status: 400 }
      );
    }

    // Update the contact to cancel appointment
    const { data, error } = await supabase
      .from('contacts')
      .update({
        scheduled_appointment_at: null,
        appointment_status: 'cancelled',
        appointment_notes: 'Appointment cancelled by user',
        last_appointment_update: new Date().toISOString()
      })
      .eq('id', contactId)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Failed to cancel appointment', error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: 'Contact not found' },
        { status: 404 }
      );
    }

    // Optionally send cancellation email here
    // await sendAppointmentCancellationEmail(data[0]);

    return NextResponse.json({
      message: 'Appointment cancelled successfully',
      contact: data[0]
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
