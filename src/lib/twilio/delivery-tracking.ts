/**
 * Message Delivery Tracking System
 * Tracks delivery status, analyzes patterns, and handles delivery failures
 */

import { createClient } from '@supabase/supabase-js';
import { getMessageStatus } from '@/lib/twilio/client';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface DeliveryStatus {
  sid: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
  dateCreated?: Date;
  dateSent?: Date;
  dateUpdated?: Date;
}

export interface DeliveryReport {
  messageId: string;
  contactId: string;
  contactName: string;
  phoneNumber: string;
  messageStatus: string;
  deliveryAttempts: number;
  lastAttemptAt: Date;
  failureReason?: string;
  recommendedAction?: string;
}

export interface DeliveryMetrics {
  totalMessages: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  failuresByReason: Record<string, number>;
  averageDeliveryTime?: number;
}

/**
 * Track delivery status for a specific message
 */
export async function trackMessageDelivery(
  messageSid: string,
  updateDatabase: boolean = true
): Promise<DeliveryStatus | null> {
  try {
    // Get latest status from Twilio
    const statusData = await getMessageStatus(messageSid);
    
    if (!statusData) {
      return null;
    }

    const deliveryStatus: DeliveryStatus = {
      sid: statusData.sid,
      status: statusData.status,
      errorCode: statusData.errorCode,
      errorMessage: statusData.errorMessage,
      dateCreated: statusData.dateCreated,
      dateSent: statusData.dateSent,
      dateUpdated: statusData.dateUpdated,
    };

    if (updateDatabase) {
      // Update message status in database
      await supabase
        .from('crm_messages')
        .update({
          message_status: statusData.status.toUpperCase(),
          error_message: statusData.errorMessage || null,
          updated_at: new Date().toISOString(),
        })
        .eq('twilio_sid', messageSid);

      // Log delivery event for analytics
      await logDeliveryEvent(messageSid, deliveryStatus);
    }

    return deliveryStatus;
  } catch (error) {
    console.error('Error tracking message delivery:', error);
    return null;
  }
}

/**
 * Check delivery status for multiple messages
 */
export async function batchCheckDeliveryStatus(
  messageSids: string[]
): Promise<Record<string, DeliveryStatus | null>> {
  const results: Record<string, DeliveryStatus | null> = {};
  
  // Process in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < messageSids.length; i += batchSize) {
    const batch = messageSids.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (sid) => {
      const status = await trackMessageDelivery(sid, true);
      return { sid, status };
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      const sid = batch[index];
      if (result.status === 'fulfilled') {
        results[sid] = result.value.status;
      } else {
        console.error(`Failed to check delivery status for ${sid}:`, result.reason);
        results[sid] = null;
      }
    });
    
    // Rate limiting delay between batches
    if (i + batchSize < messageSids.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Get delivery report for failed or problematic messages
 */
export async function getDeliveryReport(
  timeRange: 'last_24h' | 'last_week' | 'last_month' = 'last_24h'
): Promise<DeliveryReport[]> {
  try {
    let dateFilter: string;
    const now = new Date();
    
    switch (timeRange) {
      case 'last_24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last_week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last_month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }

    const { data: messages, error } = await supabase
      .from('crm_messages')
      .select(`
        id,
        contact_id,
        twilio_sid,
        message_status,
        error_message,
        updated_at,
        contacts(name, phone_number)
      `)
      .eq('direction', 'OUTBOUND')
      .in('message_status', ['FAILED', 'UNDELIVERED'])
      .gte('created_at', dateFilter)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    const reports: DeliveryReport[] = [];

    for (const message of messages || []) {
      const contact = (message as any).contacts;
      
      // Get delivery attempt count
      const { data: attempts } = await supabase
        .from('message_delivery_events')
        .select('id')
        .eq('message_sid', message.twilio_sid);

      const report: DeliveryReport = {
        messageId: message.id.toString(),
        contactId: message.contact_id.toString(),
        contactName: contact?.name || 'Unknown',
        phoneNumber: contact?.phone_number || 'Unknown',
        messageStatus: message.message_status,
        deliveryAttempts: attempts?.length || 1,
        lastAttemptAt: new Date(message.updated_at),
        failureReason: message.error_message,
        recommendedAction: getRecommendedAction(message.error_message),
      };

      reports.push(report);
    }

    return reports;
  } catch (error) {
    console.error('Error generating delivery report:', error);
    return [];
  }
}

/**
 * Get delivery metrics for analytics
 */
export async function getDeliveryMetrics(
  timeRange: 'last_24h' | 'last_week' | 'last_month' = 'last_week'
): Promise<DeliveryMetrics> {
  try {
    let dateFilter: string;
    const now = new Date();
    
    switch (timeRange) {
      case 'last_24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last_week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last_month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }

    // Get message counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .rpc('get_message_status_counts', { 
        start_date: dateFilter,
        message_direction: 'OUTBOUND'
      });

    if (statusError) {
      throw statusError;
    }

    const totalMessages = statusCounts?.reduce((sum: number, item: any) => 
      sum + item.count, 0) || 0;
    
    const delivered = statusCounts?.find((item: any) => 
      ['DELIVERED', 'READ'].includes(item.status))?.count || 0;
    
    const failed = statusCounts?.find((item: any) => 
      ['FAILED', 'UNDELIVERED'].includes(item.status))?.count || 0;
    
    const pending = statusCounts?.find((item: any) => 
      ['QUEUED', 'SENDING', 'SENT'].includes(item.status))?.count || 0;

    // Get failure reasons
    const { data: failureReasons, error: failureError } = await supabase
      .from('crm_messages')
      .select('error_message')
      .eq('direction', 'OUTBOUND')
      .in('message_status', ['FAILED', 'UNDELIVERED'])
      .gte('created_at', dateFilter)
      .not('error_message', 'is', null);

    if (failureError) {
      throw failureError;
    }

    const failuresByReason: Record<string, number> = {};
    failureReasons?.forEach((msg: any) => {
      const reason = categorizeFailureReason(msg.error_message);
      failuresByReason[reason] = (failuresByReason[reason] || 0) + 1;
    });

    // Calculate average delivery time for delivered messages
    const { data: deliveryTimes, error: deliveryError } = await supabase
      .from('message_delivery_events')
      .select('processing_time_ms')
      .gte('created_at', dateFilter)
      .eq('status', 'delivered');

    let averageDeliveryTime: number | undefined;
    if (!deliveryError && deliveryTimes?.length) {
      const totalTime = deliveryTimes.reduce((sum: number, item: any) => 
        sum + (item.processing_time_ms || 0), 0);
      averageDeliveryTime = totalTime / deliveryTimes.length;
    }

    return {
      totalMessages,
      delivered,
      failed,
      pending,
      deliveryRate: totalMessages > 0 ? (delivered / totalMessages) * 100 : 0,
      failuresByReason,
      averageDeliveryTime,
    };
  } catch (error) {
    console.error('Error getting delivery metrics:', error);
    return {
      totalMessages: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
      deliveryRate: 0,
      failuresByReason: {},
    };
  }
}

/**
 * Retry failed message delivery
 */
export async function retryFailedDelivery(
  messageId: string,
  reason?: string
): Promise<{ success: boolean; newMessageSid?: string; error?: string }> {
  try {
    // Get original message details
    const { data: originalMessage, error: fetchError } = await supabase
      .from('crm_messages')
      .select(`
        *,
        contacts(phone_number, name)
      `)
      .eq('id', messageId)
      .single();

    if (fetchError || !originalMessage) {
      throw new Error('Original message not found');
    }

    const contact = (originalMessage as any).contacts;
    if (!contact?.phone_number) {
      throw new Error('Contact phone number not available');
    }

    // Use the existing sendSMS function to retry
    const { sendSMS } = await import('@/lib/twilio/client');
    const result = await sendSMS(contact.phone_number, originalMessage.content);

    // Create new message record for the retry
    const { data: retryMessage, error: createError } = await supabase
      .from('crm_messages')
      .insert([
        {
          contact_id: originalMessage.contact_id,
          content: originalMessage.content,
          direction: 'OUTBOUND',
          message_status: 'SENT',
          message_type: originalMessage.message_type,
          template_id: originalMessage.template_id,
          twilio_sid: result.sid,
        },
      ])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Update original message to mark it as retried
    await supabase
      .from('crm_messages')
      .update({
        error_message: `${originalMessage.error_message || ''} | Retried: ${reason || 'Manual retry'}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    // Log the retry event
    await supabase.from('message_delivery_events').insert([
      {
        message_sid: result.sid,
        status: 'retry_sent',
        processing_time_ms: 0,
        metadata: {
          original_message_id: messageId,
          retry_reason: reason,
        },
      },
    ]);

    return {
      success: true,
      newMessageSid: result.sid,
    };
  } catch (error) {
    console.error('Error retrying message delivery:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Log delivery event for analytics
 */
async function logDeliveryEvent(
  messageSid: string,
  deliveryStatus: DeliveryStatus
): Promise<void> {
  try {
    const processingTime = deliveryStatus.dateSent && deliveryStatus.dateCreated
      ? new Date(deliveryStatus.dateSent).getTime() - new Date(deliveryStatus.dateCreated).getTime()
      : undefined;

    await supabase.from('message_delivery_events').insert([
      {
        message_sid: messageSid,
        status: deliveryStatus.status.toLowerCase(),
        processing_time_ms: processingTime,
        error_code: deliveryStatus.errorCode,
        error_message: deliveryStatus.errorMessage,
        metadata: {
          date_created: deliveryStatus.dateCreated,
          date_sent: deliveryStatus.dateSent,
          date_updated: deliveryStatus.dateUpdated,
        },
      },
    ]);
  } catch (error) {
    console.error('Error logging delivery event:', error);
  }
}

/**
 * Get recommended action based on error message
 */
function getRecommendedAction(errorMessage?: string): string {
  if (!errorMessage) {
    return 'Investigate delivery failure';
  }

  const error = errorMessage.toLowerCase();
  
  if (error.includes('invalid phone number') || error.includes('not a valid phone number')) {
    return 'Verify and correct phone number format';
  }
  
  if (error.includes('blocked') || error.includes('opt out') || error.includes('stop')) {
    return 'Contact has opted out - remove from messaging list';
  }
  
  if (error.includes('carrier violation') || error.includes('spam')) {
    return 'Review message content for compliance';
  }
  
  if (error.includes('queue overflow') || error.includes('rate limit')) {
    return 'Retry after delay - temporary issue';
  }
  
  if (error.includes('unreachable destination') || error.includes('destination unreachable')) {
    return 'Phone number may be inactive - verify with contact';
  }
  
  return 'Review error details and contact support if needed';
}

/**
 * Categorize failure reason for analytics
 */
function categorizeFailureReason(errorMessage?: string): string {
  if (!errorMessage) {
    return 'Unknown Error';
  }

  const error = errorMessage.toLowerCase();
  
  if (error.includes('invalid') || error.includes('not a valid')) {
    return 'Invalid Phone Number';
  }
  
  if (error.includes('blocked') || error.includes('opt out') || error.includes('stop')) {
    return 'Recipient Opted Out';
  }
  
  if (error.includes('carrier violation') || error.includes('spam')) {
    return 'Carrier Violation';
  }
  
  if (error.includes('queue overflow') || error.includes('rate limit')) {
    return 'Rate Limiting';
  }
  
  if (error.includes('unreachable')) {
    return 'Unreachable Destination';
  }
  
  return 'Other Error';
}

/**
 * Schedule automatic delivery tracking for pending messages
 */
export async function scheduleDeliveryTracking(): Promise<void> {
  try {
    // Get messages that are in transit (sent but not delivered/failed)
    const { data: pendingMessages, error } = await supabase
      .from('crm_messages')
      .select('twilio_sid')
      .eq('direction', 'OUTBOUND')
      .in('message_status', ['QUEUED', 'SENDING', 'SENT'])
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

    if (error) {
      throw error;
    }

    if (pendingMessages?.length) {
      console.log(`Tracking delivery status for ${pendingMessages.length} pending messages`);
      
      const sids = pendingMessages.map(msg => msg.twilio_sid).filter(Boolean);
      await batchCheckDeliveryStatus(sids);
    }
  } catch (error) {
    console.error('Error scheduling delivery tracking:', error);
  }
}