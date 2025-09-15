/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/resend-email-sender.ts - Resend integration for newsletters
import { Resend } from 'resend';

// Use the new API key with full permissions for audience management
const resendAudience = new Resend(process.env.RESEND_AUDIENCE_API_KEY);
// Keep the restricted API key for regular email sending  
const resendEmail = new Resend(process.env.RESEND_API_KEY);
const audienceId = process.env.RESEND_AUDIENCE_ID || 'e12a1895-312b-4738-af4c-9100196fdc25';

// Note: Using separate API keys for different Resend operations
// resendEmail: For sending individual emails (restricted key)
// resendAudience: For audience management and broadcasts (full access key)

interface EmailData {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
  fromName?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  emailId?: string;
  message?: string;
  error?: string;
  shouldRetry?: boolean;
  details?: any;
}

interface SubscriberData {
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
}

// Add subscriber to Resend audience
export const addSubscriberToAudience = async (
  subscriberData: SubscriberData
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    const { data, error } = await resendAudience.contacts.create({
      email: subscriberData.email,
      firstName: subscriberData.firstName,
      lastName: subscriberData.lastName,
      unsubscribed: subscriberData.unsubscribed || false,
      audienceId: audienceId,
    });

    if (error) {
      console.error('Resend API error adding subscriber:', error);
      return {
        success: false,
        error: error.message || 'Failed to add subscriber to audience',
      };
    }

    // Successfully added subscriber to audience
    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding subscriber to Resend audience:', error);
    return {
      success: false,
      error: error.message || 'Failed to add subscriber to audience',
    };
  }
};

// Update subscriber in Resend audience
export const updateSubscriberInAudience = async (
  email: string,
  subscriberData: Partial<SubscriberData>
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    const { data, error } = await resendAudience.contacts.update({
      email: email,
      audienceId: audienceId,
      ...subscriberData,
    });

    if (error) {
      console.error('Resend API error updating subscriber:', error);
      return {
        success: false,
        error: error.message || 'Failed to update subscriber in audience',
      };
    }

    // Successfully updated subscriber in audience
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating subscriber in Resend audience:', error);
    return {
      success: false,
      error: error.message || 'Failed to update subscriber in audience',
    };
  }
};

// Send individual email using Resend
export const sendCustomEmail = async (
  emailData: EmailData
): Promise<EmailResult> => {
  try {
    const { data, error } = await resendEmail.emails.send({
      from: `${emailData.fromName || 'Kay from Toasted Sesame'} <${emailData.replyTo || 'care@toastedsesametherapy.com'}>`,
      to: [emailData.recipientEmail],
      subject: emailData.subject,
      html: emailData.htmlContent,
    });

    if (error) {
      console.error('Resend API error sending email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        details: error,
      };
    }

    // Successfully sent email
    return {
      success: true,
      emailId: data?.id,
      message: 'Email sent successfully',
    };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
      details: error,
    };
  }
};

// Enhanced retry function with exponential backoff
export const sendCustomEmailWithRetry = async (
  emailData: EmailData,
  maxRetries = 3,
  baseDelay = 1000
): Promise<EmailResult> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendCustomEmail(emailData);

    if (result.success) {
      return result;
    }

    // If we have retries left, wait and retry
    if (attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    // If we're out of retries
    console.error(
      `Failed to send email after ${attempt} attempts:`,
      result.error
    );
    return result;
  }

  // This should never be reached, but TypeScript requires it
  return {
    success: false,
    error: 'Maximum retries exceeded',
  };
};

// Send newsletter to entire audience
export const sendNewsletterToAudience = async (
  subject: string,
  htmlContent: string,
  fromName: string = 'Kay from Toasted Sesame',
  replyTo: string = 'care@toastedsesametherapy.com'
): Promise<EmailResult> => {
  try {
    const { data, error } = await resendAudience.broadcasts.create({
      from: `${fromName} <${replyTo}>`,
      subject: subject,
      html: htmlContent,
      audienceId: audienceId,
    });

    if (error) {
      console.error('Resend API error sending newsletter:', error);
      return {
        success: false,
        error: error.message || 'Failed to send newsletter',
        details: error,
      };
    }

    // Successfully sent newsletter to audience
    return {
      success: true,
      emailId: data?.id,
      message: 'Newsletter sent successfully to audience',
    };
  } catch (error: any) {
    console.error('Newsletter sending error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send newsletter',
      details: error,
    };
  }
};