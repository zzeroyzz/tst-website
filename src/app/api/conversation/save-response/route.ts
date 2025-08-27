import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { contactId, questionId, question, response, responseValue } = await request.json();

    if (!contactId || !questionId || !question || !response) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current contact data
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('custom_fields, crm_notes')
      .eq('id', contactId)
      .single();

    if (fetchError) {
      console.error('Error fetching contact:', fetchError);
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Update custom_fields with conversation responses
    const currentCustomFields = contact.custom_fields || {};
    const conversationResponses = currentCustomFields.conversation_responses || {};
    
    // Add this response
    conversationResponses[questionId] = {
      question,
      response,
      responseValue,
      timestamp: new Date().toISOString()
    };

    // Update contact with new conversation data
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        custom_fields: {
          ...currentCustomFields,
          conversation_responses: conversationResponses
        },
        crm_notes: contact.crm_notes ? 
          `${contact.crm_notes} | ${question}: ${response}` : 
          `Conversation: ${question}: ${response}`
      })
      .eq('id', contactId);

    if (updateError) {
      console.error('Error updating contact:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Response saved successfully' 
    });

  } catch (error) {
    console.error('Error saving conversation response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}