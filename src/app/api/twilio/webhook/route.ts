import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  validateWebhookSignature,
  parseIncomingMessage,
  type IncomingMessage,
} from '@/lib/twilio/client';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('🚨 WEBHOOK HIT - Starting processing');
  try {
    // Get the raw body for signature validation
    const body = await request.text();
    const params = new URLSearchParams(body);
    const bodyParams = Object.fromEntries(params.entries());

    console.log('🚨 RAW BODY:', body);
    console.log('🚨 PARSED PARAMS:', bodyParams);

    // Parse the incoming message
    const incomingMessage: IncomingMessage = parseIncomingMessage(bodyParams);

    console.log('🚨 PARSED MESSAGE:', incomingMessage);
    console.log('🚨 HAS BODY?', !!incomingMessage.body);
    console.log('🚨 HAS STATUS?', !!incomingMessage.messageStatus);
    console.log('🚨 MESSAGE STATUS VALUE:', JSON.stringify(incomingMessage.messageStatus));

    // Handle different types of webhooks
    if (incomingMessage.messageStatus && incomingMessage.messageStatus.trim() !== '') {
      // This is a status update for an outbound message
      console.log('🚨 ROUTING TO: handleMessageStatusUpdate');
      await handleMessageStatusUpdate(incomingMessage);
    } else if (incomingMessage.body && incomingMessage.body.trim() !== '') {
      // This is an incoming message
      console.log('🚨 ROUTING TO: handleIncomingMessage');
      await handleIncomingMessage(incomingMessage);
    } else {
      console.log('🚨 NO ROUTING - Neither valid body nor status found');
      console.log('🚨 Body value:', JSON.stringify(incomingMessage.body));
      console.log('🚨 Status value:', JSON.stringify(incomingMessage.messageStatus));
    }

    // Return TwiML response (empty for now)
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response></Response>`;

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle status updates for outbound messages
 */
async function handleMessageStatusUpdate(message: IncomingMessage) {
  try {
    // Update message status in database
    const { error } = await supabase
      .from('crm_messages')
      .update({
        message_status: message.messageStatus.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('twilio_sid', message.messageSid);

    if (error) {
      console.error('Error updating message status:', error);
    } else {
      console.log(
        `Updated message ${message.messageSid} status to ${message.messageStatus}`
      );
    }
  } catch (error) {
    console.error('Error handling message status update:', error);
  }
}

/**
 * Handle incoming messages from contacts
 */
async function handleIncomingMessage(message: IncomingMessage) {
  console.log('🚨 HANDLEINCOMINGMESSAGE CALLED WITH:', message);
  try {
    // Find contact by phone number
    console.log('🚨 LOOKING FOR CONTACT WITH PHONE:', message.from);
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, name, email, phone_number')
      .eq('phone_number', message.from)
      .single();

    console.log('🚨 CONTACT QUERY RESULT:', { contact, error: contactError });
    
    if (contactError && contactError.code !== 'PGRST116') {
      console.error('❌ Error finding contact:', contactError);
      return;
    }

    let contactId = contact?.id;

    // If contact not found, create a new one
    if (!contact) {
      console.log('🔍 DEBUG: Contact not found, creating new contact for:', message.from);
      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert([
          {
            name: `Contact ${message.from}`,
            email: `${message.from.replace(/\D/g, '')}@unknown.com`,
            phone_number: message.from,
            contact_status: 'ACTIVE',
            segments: ['Unknown'],
            archived: false,
            crm_notes: 'Auto-created from incoming message',
          },
        ])
        .select('id')
        .single();

      console.log('🔍 DEBUG: Contact creation result:', { newContact, error: createError });

      if (createError) {
        console.error('❌ Error creating contact:', createError);
        return;
      }

      contactId = newContact.id;
      console.log(`✅ Created new contact ${contactId} for phone ${message.from}`);
    }

    // Store the incoming message
    console.log('🚨 ABOUT TO STORE MESSAGE WITH CONTACT ID:', contactId);
    const messageData = {
      contact_id: contactId,
      content: message.body,
      direction: 'INBOUND',
      message_status: 'RECEIVED',
      message_type: message.messageType.toUpperCase(),
      twilio_sid: message.messageSid,
    };
    console.log('🚨 MESSAGE DATA TO INSERT:', messageData);

    console.log('🚨 CALLING SUPABASE INSERT...');
    const { error: messageError, data: insertedMessage } = await supabase.from('crm_messages').insert([messageData]).select();

    console.log('🚨 SUPABASE INSERT COMPLETE - ERROR:', messageError);
    console.log('🚨 SUPABASE INSERT COMPLETE - DATA:', insertedMessage);

    if (messageError) {
      console.error('🚨 CRITICAL MESSAGE INSERT FAILED:', messageError);
      throw new Error(`Failed to insert message: ${JSON.stringify(messageError)}`);
    } else {
      console.log('🚨 SUCCESS: Message inserted:', insertedMessage);
    }

    // Create notification for dashboard
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          type: 'message_received',
          title: 'New Message Received',
          message: `${contact?.name || 'Unknown contact'} sent: "${message.body.substring(0, 50)}${message.body.length > 50 ? '...' : ''}"`,
          contact_id: contactId,
          contact_name: contact?.name || `Contact ${message.from}`,
          contact_email: contact?.email || '',
          read: false,
        },
      ]);

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

// GET method for webhook URL verification (if needed)
export async function GET() {
  return NextResponse.json({ message: 'Twilio webhook endpoint' });
}
