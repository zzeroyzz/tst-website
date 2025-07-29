/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/email-sender.ts - Enhanced version
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

interface EmailData {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
  listId: string;
  campaignTitle: string;
  fromName?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  campaignId?: string;
  message?: string;
  error?: string;
  shouldRetry?: boolean;
  details?: any;
}

export const sendCustomEmail = async (emailData: EmailData): Promise<EmailResult> => {
  try {
    // console.log(`Creating Mailchimp campaign for: ${emailData.recipientEmail}`);

    // Create a targeted campaign for the specific email
    const campaignResponse = await mailchimp.campaigns.create({
      type: 'regular',
      recipients: {
        list_id: emailData.listId,
        segment_opts: {
          match: 'any',
          conditions: [{
            condition_type: 'EmailAddress',
            field: 'EMAIL',
            op: 'is',
            value: emailData.recipientEmail
          }]
        }
      },
      settings: {
        subject_line: emailData.subject,
        title: emailData.campaignTitle,
        from_name: emailData.fromName || 'Kay from Toasted Sesame',
        reply_to: emailData.replyTo || 'care@toastedsesametherapy.com',
        authenticate: true,
        auto_footer: false,
        fb_comments: false,
      },
      tracking: {
        opens: true,
        html_clicks: true,
        text_clicks: false,
      }
    });

    // Type assertion to handle the response properly
    const campaign = campaignResponse as any;

    if (!campaign.id) {
      throw new Error('Campaign creation failed - no ID returned');
    }

    // console.log(`Campaign created with ID: ${campaign.id}`);

    // Set the custom HTML content
    await mailchimp.campaigns.setContent(campaign.id, {
      html: emailData.htmlContent
    });

    // console.log(`Content set for campaign: ${campaign.id}`);

    // Send the campaign
    await mailchimp.campaigns.send(campaign.id);

    // console.log(`Campaign sent successfully: ${campaign.id}`);

    return {
      success: true,
      campaignId: campaign.id,
      message: 'Email sent successfully'
    };

  } catch (error: any) {
    console.error('Email sending error:', error);

    // Handle specific error cases
    if (error.status === 400) {
      const errorDetail = error.response?.body?.detail || '';

      // No members in segment (timing issue)
      if (errorDetail.includes('no members') || errorDetail.includes('0 members')) {
        return {
          success: false,
          error: 'Recipient not found in audience - likely timing issue',
          shouldRetry: true
        };
      }

      // Already sent (if somehow duplicate)
      if (errorDetail.includes('already sent')) {
        return {
          success: false,
          error: 'Campaign already sent',
          shouldRetry: false
        };
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to send email',
      details: error.response?.body
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
    // console.log(`Email send attempt ${attempt}/${maxRetries} for ${emailData.recipientEmail}`);

    const result = await sendCustomEmail(emailData);

    if (result.success) {
      return result;
    }

    // If it's a timing issue and we have retries left
    if (result.shouldRetry && attempt < maxRetries) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt - 1);
      // console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    // If we're out of retries or it's a different error
    console.error(`Failed to send email after ${attempt} attempts:`, result.error);
    return result;
  }

  // This should never be reached, but TypeScript requires it
  return {
    success: false,
    error: 'Maximum retries exceeded'
  };
};
