import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn(
    'Twilio credentials not configured. SMS/WhatsApp functionality will be disabled.'
  );
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface SendSMSResponse {
  sid: string;
  status: string;
  errorMessage?: string;
}

export interface SendWhatsAppResponse {
  sid: string;
  status: string;
  errorMessage?: string;
}

/**
 * Send SMS message via Twilio
 */
export async function sendSMS(
  to: string,
  body: string
): Promise<SendSMSResponse> {
  if (!client || !twilioPhoneNumber) {
    throw new Error('Twilio SMS not configured');
  }

  try {
    // Ensure phone number is in E.164 format
    const formattedTo = formatPhoneNumber(to);

    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to: formattedTo,
    });

    return {
      sid: message.sid,
      status: message.status || 'queued',
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsApp(
  to: string,
  body: string
): Promise<SendWhatsAppResponse> {
  if (!client || !twilioPhoneNumber) {
    throw new Error('Twilio WhatsApp not configured');
  }

  try {
    // Ensure phone number is in E.164 format
    const formattedTo = formatPhoneNumber(to);

    const message = await client.messages.create({
      body,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${formattedTo}`,
    });

    return {
      sid: message.sid,
      status: message.status || 'queued',
    };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}

/**
 * Get message status from Twilio
 */
export async function getMessageStatus(messageSid: string) {
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    const message = await client.messages(messageSid).fetch();
    return {
      sid: message.sid,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
    };
  } catch (error: any) {
    console.error('Error fetching message status:', error);
    throw new Error(`Failed to fetch message status: ${error.message}`);
  }
}

/**
 * Validate webhook signature for security
 */
export function validateWebhookSignature(
  signature: string,
  url: string,
  params: Record<string, any>
): boolean {
  if (!authToken) {
    console.warn(
      'Twilio auth token not configured, skipping webhook validation'
    );
    return false;
  }

  try {
    return twilio.validateRequest(authToken, signature, url, params);
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If it doesn't start with +, assume US number and add +1
  if (!phoneNumber.startsWith('+')) {
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
  }

  // If it starts with +, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }

  // Default to assuming US number
  return `+1${digits}`;
}

/**
 * Parse incoming webhook message
 */
export interface IncomingMessage {
  messageSid: string;
  accountSid: string;
  from: string;
  to: string;
  body: string;
  messageStatus: string;
  messageType: 'sms' | 'whatsapp';
}

export function parseIncomingMessage(
  params: Record<string, any>
): IncomingMessage {
  const isWhatsApp =
    params.From?.startsWith('whatsapp:') || params.To?.startsWith('whatsapp:');

  return {
    messageSid: params.MessageSid || params.SmsSid,
    accountSid: params.AccountSid,
    from: isWhatsApp ? params.From?.replace('whatsapp:', '') : params.From,
    to: isWhatsApp ? params.To?.replace('whatsapp:', '') : params.To,
    body: params.Body,
    messageStatus: params.MessageStatus || params.SmsStatus,
    messageType: isWhatsApp ? 'whatsapp' : 'sms',
  };
}

export default client;
