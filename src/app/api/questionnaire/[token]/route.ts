// src/app/api/questionnaire/[token]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const { data: contact, error } = await supabase
      .from('contacts')
      .select('id, name, email, questionnaire_completed, questionnaire_completed_at')
      .eq('questionnaire_token', token)
      .single();

    if (error || !contact) {
      return NextResponse.json({ error: 'Invalid questionnaire link.' }, { status: 404 });
    }

    if (contact.questionnaire_completed) {
      return NextResponse.json(
        { error: 'Questionnaire already completed.', completedAt: contact.questionnaire_completed_at },
        { status: 409 }
      );
    }

    return NextResponse.json({ contact: { id: contact.id, name: contact.name, email: contact.email } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const nowIso = new Date().toISOString();

    // 1) Out-of-state (GA = false) — mark and COMPLETE
    if (body.isInGeorgia === false) {
      const { error } = await supabase
        .from('contacts')
        .update({
          located_in_georgia: false,
          qualified_lead: false,
          questionnaire_completed: true,
          questionnaire_completed_at: nowIso,
        })
        .eq('questionnaire_token', token);
      if (error) throw error;
      return NextResponse.json({ message: 'Questionnaire completed (out-of-state).' });
    }

    // 2) In-state but budget NO — mark and COMPLETE
    if (body.isInGeorgia === true && body.budgetWorks === false) {
      const { error } = await supabase
        .from('contacts')
        .update({
          located_in_georgia: true,
          budget_works: false,
          qualified_lead: false,
          questionnaire_completed: true,
          questionnaire_completed_at: nowIso,
        })
        .eq('questionnaire_token', token);
      if (error) throw error;
      return NextResponse.json({ message: 'Questionnaire completed (budget not fit).' });
    }

    // 3) In-state + budget YES — pre-mark (do NOT complete)
    if (body.isInGeorgia === true && body.budgetWorks === true && !body.complete) {
      const { error } = await supabase
        .from('contacts')
        .update({
          located_in_georgia: true,
          budget_works: true,
          qualified_lead: true,
        })
        .eq('questionnaire_token', token);
      if (error) throw error;
      return NextResponse.json({ message: 'Lead marked as qualified and in Georgia.' });
    }

    // 4) Full completion (requires all fields)
    const { interestedIn, schedulingPreference, paymentMethod, budgetWorks, isInGeorgia } = body;
    if (!interestedIn || !schedulingPreference || !paymentMethod || typeof budgetWorks !== 'boolean') {
      return NextResponse.json({ error: 'All questionnaire fields are required.' }, { status: 400 });
    }

    // Ensure link is valid & not already completed
    const { data: contact, error: findError } = await supabase
      .from('contacts')
      .select('id, questionnaire_completed')
      .eq('questionnaire_token', token)
      .single();
    if (findError || !contact) {
      return NextResponse.json({ error: 'Invalid questionnaire link.' }, { status: 404 });
    }
    if (contact.questionnaire_completed) {
      return NextResponse.json({ error: 'Questionnaire already completed.' }, { status: 409 });
    }

    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        interested_in: interestedIn,
        scheduling_preference: schedulingPreference,
        payment_method: paymentMethod,
        budget_works: budgetWorks,
        located_in_georgia: !!isInGeorgia,
        qualified_lead: !!isInGeorgia && !!budgetWorks,
        questionnaire_completed: true,
        questionnaire_completed_at: nowIso,
      })
      .eq('questionnaire_token', token);
    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Questionnaire completed successfully!' }, { status: 200 });
  } catch (e) {
    console.error('Error submitting questionnaire:', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
