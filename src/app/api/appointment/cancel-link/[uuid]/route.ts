import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only

function supabaseServer() {
  // Use SERVICE ROLE on server routes to bypass RLS for internal lookups
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ uuid: string }> } // Next 15: params may be async
  ) {
  try {
    const { uuid } = await ctx.params;
    console.log('[cancel-link] incoming uuid:', uuid);
    console.log('[cancel-link] supabase project:', {
      url: SUPABASE_URL,
      urlRefGuess: SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] ?? 'unknown',
      hasServiceRole: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    });

    const supabase = supabaseServer();

    // --- Attempt 1: by contacts.uuid
    let { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .select(
        `
          id,
          uuid,
          user_id,
          name,
          email,
          phone_number,
          contact_status,
          appointment_status,
          scheduled_appointment_at
        `
      )
      .eq('uuid', uuid)
      .single();

    if (contactErr || !contact) {
      console.warn('[cancel-link] lookup by contacts.uuid failed, attempting by contacts.user_id', contactErr);

      // --- Attempt 2: by contacts.user_id (your row shows user_id === uuid)
      const alt = await supabase
        .from('contacts')
        .select(
          `
            id,
            uuid,
            user_id,
            name,
            email,
            phone_number,
            contact_status,
            appointment_status,
            scheduled_appointment_at
          `
        )
        .eq('user_id', uuid)
        .single();

      contact = alt.data ?? null;
      contactErr = alt.error ?? contactErr;
    }

    if (!contact) {
      console.error('[cancel-link] no contact found for uuid after both attempts:', uuid, contactErr);
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    console.log('[cancel-link] contact resolved:', {
      contactId: contact.id,
      contactUuid: contact.uuid,
      userId: contact.user_id,
      email: contact.email,
    });

    // Latest appointment (order by scheduled_at desc; fall back to created_at if you prefer)
    const { data: appointment, error: apptErr } = await supabase
      .from('appointments')
      .select(
        `
          id,
          contact_id,
          contact_uuid,
          scheduled_at,
          status,
          time_zone,
          created_at,
          updated_at,
          notes
        `
      )
      .eq('contact_uuid', contact.uuid)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (apptErr) {
      console.warn('[cancel-link] appointment lookup error (non-fatal):', apptErr);
    }

    console.log('[cancel-link] latest appointment:', {
      apptId: appointment?.id ?? null,
      scheduledAt: appointment?.scheduled_at ?? null,
      status: appointment?.status ?? null,
    });

    return NextResponse.json(
      { contact, appointment },
      { status: 200 }
    );
  } catch (err) {
    console.error('[cancel-link] unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

