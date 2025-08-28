// app/api/twilio/webhook/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Normalize to E.164 (US default)
function normalizePhone(raw?: string) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return raw;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export async function POST(request: NextRequest) {
  console.log('=== SMS WEBHOOK FIRED ===', new Date().toISOString());

  try {
    // Twilio sends application/x-www-form-urlencoded
    const fd = await request.formData();
    const p: Record<string, string> = {};
    for (const [k, v] of fd.entries()) p[k] = String(v);

    const body = p.Body || '';
    const from = normalizePhone(p.From);
    const to = normalizePhone(p.To);
    const sid = p.MessageSid || p.SmsSid || '';

    console.log('SMS params:', { from, to, hasBody: !!body, sid });

    if (!from || !body || !sid) {
      console.warn('Missing required SMS fields');
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
        status: 200, headers: { 'Content-Type': 'application/xml' }
      });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !key) {
      console.error('Supabase env missing');
      return NextResponse.json({ error: 'supabase_env_missing' }, { status: 500 });
    }
    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // Find or create contact by phone_number
    let { data: contact, error: findErr } = await supabase
      .from('contacts')
      .select('id')
      .eq('phone_number', from)
      .single();

    if (findErr && findErr.code === 'PGRST116') {
      // Contact not found, create new one
      const placeholderEmail = `${from.replace(/\D/g, '')}+${sid}@sms.local`;
      const { data: newContact, error: createErr } = await supabase
        .from('contacts')
        .insert([{
          phone_number: from,
          name: `SMS Contact ${from}`,
          email: placeholderEmail,
          contact_status: 'ACTIVE',
          archived: false,
          appointment_status: null
        }])
        .select('id')
        .single();
      
      if (createErr) {
        console.error('Contact creation error:', createErr);
        return NextResponse.json({ error: 'contact_creation_failed', details: createErr }, { status: 500 });
      }
      contact = newContact;
    } else if (findErr) {
      console.error('Contact lookup error:', findErr);
      return NextResponse.json({ error: 'contact_lookup_failed', details: findErr }, { status: 500 });
    }


    if (!contact) {
      console.error('No contact found after lookup/creation');
      return NextResponse.json({ error: 'contact_resolution_failed' }, { status: 500 });
    }

    console.log('contact_id:', contact.id);

    const { data: saved, error: msgErr } = await supabase
      .from('crm_messages')
      .insert([{
        contact_id: contact.id,
        content: body,
        direction: 'INBOUND',
        message_status: 'RECEIVED',
        message_type: 'SMS',
        twilio_sid: sid
      }])
      .select('id')
      .single();

    if (msgErr) {
      console.error('Message insert error:', msgErr);
      return NextResponse.json({ error: 'message_insert_failed', details: msgErr }, { status: 500 });
    }

    console.log('saved_message_id:', saved.id);

    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
      status: 200, headers: { 'Content-Type': 'application/xml' }
    });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('Webhook fatal error:', errorMessage);
    return NextResponse.json({ error: 'fatal', details: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  console.log('=== SMS WEBHOOK GET ===');
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
