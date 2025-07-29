/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/email-analytics.ts - Optional helper for tracking
import mailchimp from '@mailchimp/mailchimp_marketing';

// Helper to get campaign analytics
export const getCampaignAnalytics = async (campaignId: string) => {
  try {
    const [campaign, reports] = await Promise.all([
      mailchimp.campaigns.get(campaignId),
      mailchimp.reports.get(campaignId)
    ]);

    return {
      success: true,
      data: {
        campaignInfo: {
          id: campaign.id,
          title: campaign.settings.title,
          subject: campaign.settings.subject_line,
          status: campaign.status,
          sendTime: campaign.send_time,
        },
        analytics: {
          opens: reports.opens.opens_total,
          uniqueOpens: reports.opens.unique_opens,
          clicks: reports.clicks.clicks_total,
          uniqueClicks: reports.clicks.unique_clicks,
          unsubscribes: reports.unsubscribed.unsubscribes,
          bounces: reports.bounces.hard_bounces + reports.bounces.soft_bounces,
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching campaign analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper to get recent automated email campaigns
export const getAutomatedEmailCampaigns = async (count = 10) => {
  try {
    const campaigns = await mailchimp.campaigns.list({
      count,
      sort_field: 'send_time',
      sort_dir: 'DESC',
      status: 'sent'
    });

    // Filter for your automated emails (by title pattern)
    const automatedCampaigns = campaigns.campaigns.filter(campaign =>
      campaign.settings.title.includes('Welcome Email') ||
      campaign.settings.title.includes('Contact Confirmation')
    );

    return {
      success: true,
      campaigns: automatedCampaigns
    };
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
