// src/lib/zapier-email-sender.ts
interface ZapierEmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const sendEmailViaZapier = async (emailData: ZapierEmailData): Promise<EmailResult> => {
  if (!process.env.ZAPIER_EMAIL_WEBHOOK_URL) {
    console.error('ZAPIER_EMAIL_WEBHOOK_URL not configured');
    return {
      success: false,
      error: 'Email service not configured'
    };
  }

  try {
    const response = await fetch(process.env.ZAPIER_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.html, // Zapier Gmail expects 'body' for HTML content
        from: emailData.from || 'care@toastedsesametherapy.com',
        fromName: emailData.fromName || 'Toasted Sesame Therapy',
        replyTo: emailData.replyTo || 'care@toastedsesametherapy.com'
      }),
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook failed: ${response.status} ${response.statusText}`);
    }

    return {
      success: true,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Zapier email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
};

// Wrapper function with retry logic
export const sendZapierEmailWithRetry = async (
  emailData: ZapierEmailData,
  maxRetries = 3,
  baseDelay = 1000
): Promise<EmailResult> => {

  for (let attempt = 1; attempt <= maxRetries; attempt++) {

    const result = await sendEmailViaZapier(emailData);

    if (result.success) {
      return result;
    }

    // If we have retries left, wait and try again
    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    // Final attempt failed
    console.error(`Failed to send email after ${attempt} attempts:`, result.error);
    return result;
  }

  return {
    success: false,
    error: 'Maximum retries exceeded'
  };
};
