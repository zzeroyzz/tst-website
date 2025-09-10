// src/app/api/appointment/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest) {
  try {
    const { contactId, uuid, status } = await request.json();

    // Accept either contactId or uuid for backward compatibility
    const identifier = contactId || uuid;
    
    if (!identifier || !status) {
      return NextResponse.json(
        { message: 'Contact ID or UUID and status are required' },
        { status: 400 }
      );
    }

    // Validate status (normalize to uppercase for database)
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
    const normalizedStatus = status.toLowerCase();
    
    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          message:
            'Invalid status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 }
      );
    }

    // Determine which field to use for lookup (UUID preferred if available)
    const isUuid = typeof identifier === 'string' && identifier.includes('-');
    const lookupField = isUuid ? 'uuid' : 'id';
    const dbStatus = normalizedStatus.toUpperCase(); // Database expects uppercase
    
    // Update the appointment status
    const { data, error } = await supabase
      .from('contacts')
      .update({
        appointment_status: dbStatus,
        updated_at: new Date().toISOString(),
        // Add completion note if marking as completed
        appointment_notes:
          normalizedStatus === 'completed'
            ? 'Appointment completed - marked by admin'
            : undefined,
      })
      .eq(lookupField, identifier)
      .select();

    if (error) {
      console.error('Database error updating status:', error);
      return NextResponse.json(
        {
          message: 'Failed to update appointment status',
          error: error.message,
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: `Contact not found with ${lookupField}: ${identifier}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Appointment status updated successfully',
      contact: data[0],
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
