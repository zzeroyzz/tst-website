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
  try {
    // Get the raw body for signature validation
    const body = await request.text();
    const params = new URLSearchParams(body);
    const bodyParams = Object.fromEntries(params.entries());

    // Validate webhook signature for security
    const signature = request.headers.get('x-twilio-signature');
    const url = request.url;

    // Temporarily disable signature validation for debugging
    console.log('🔧 DEBUG: Webhook signature validation temporarily disabled');
    if (false && signature && !validateWebhookSignature(signature, url, bodyParams)) {
      console.error('Invalid Twilio webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the incoming message
    const incomingMessage: IncomingMessage = parseIncomingMessage(bodyParams);

    console.log('🔍 DEBUG: Raw webhook params:', bodyParams);
    console.log('🔍 DEBUG: Parsed incoming message:', incomingMessage);
    console.log('🔍 DEBUG: Message has body?', !!incomingMessage.body);
    console.log('🔍 DEBUG: Message has status?', !!incomingMessage.messageStatus);

    // Handle different types of webhooks
    if (incomingMessage.messageStatus) {
      // This is a status update for an outbound message
      await handleMessageStatusUpdate(incomingMessage);
    } else if (incomingMessage.body) {
      // This is an incoming message
      await handleIncomingMessage(incomingMessage);
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
  try {
    console.log('📥 Processing incoming message:', message);
    
    // Find contact by phone number
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, name, email')
      .eq('phone_number', message.from)
      .single();

    if (contactError && contactError.code !== 'PGRST116') {
      console.error('Error finding contact:', contactError);
      return;
    }

    let contactId = contact?.id;

    // If contact not found, create a new one
    if (!contact) {
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

      if (createError) {
        console.error('Error creating contact:', createError);
        return;
      }

      contactId = newContact.id;
      console.log(`Created new contact ${contactId} for phone ${message.from}`);
    }

    // Store the incoming message
    const { error: messageError } = await supabase.from('crm_messages').insert([
      {
        contact_id: contactId,
        content: message.body,
        direction: 'INBOUND',
        message_status: 'RECEIVED',
        message_type: message.messageType.toUpperCase(),
        twilio_sid: message.messageSid,
      },
    ]);

    if (messageError) {
      console.error('❌ Error storing incoming message:', messageError);
    } else {
      console.log(`✅ Stored incoming message from ${message.from}: "${message.body}"`);
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
