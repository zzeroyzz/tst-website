/**
 * Optimal Twilio Webhook Processing System
 * Hybrid approach with intelligent routing and fallback
 */

import { createClient } from '@supabase/supabase-js';
import { apolloClient } from '@/lib/apollo/client';
import { PROCESS_INCOMING_MESSAGE, UPDATE_MESSAGE_STATUS_WEBHOOK } from '@/lib/graphql/mutations';
import { validateWebhookSignature, type IncomingMessage } from '@/lib/twilio/client';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface WebhookProcessingResult {
  success: boolean;
  processed_via: 'graphql' | 'direct_db' | 'fallback';
  operation_type: 'message_received' | 'status_update' | 'unknown';
  message_id?: string;
  contact_id?: string;
  error?: string;
  fallback_required?: boolean;
}

/**
 * Main webhook processor with intelligent routing
 */
export async function processWebhook(
  message: IncomingMessage,
  isFallback: boolean = false
): Promise<WebhookProcessingResult> {
  try {
    // Determine processing strategy
    const strategy = determineProcessingStrategy(message, isFallback);
    
    switch (strategy) {
      case 'graphql_full':
        return await processViaGraphQL(message);
      
      case 'direct_fast':
        return await processDirectDB(message);
      
      case 'fallback_simple':
        return await processFallback(message);
      
      default:
        throw new Error(`Unknown processing strategy: ${strategy}`);
    }
  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    // If primary processing fails and we haven't tried fallback, suggest fallback
    if (!isFallback) {
      return {
        success: false,
        processed_via: 'direct_db',
        operation_type: 'unknown',
        error: (error as Error).message,
        fallback_required: true
      };
    }
    
    // Even fallback failed - this is critical
    await logCriticalFailure(message, error as Error);
    
    return {
      success: false,
      processed_via: 'fallback',
      operation_type: 'unknown',
      error: (error as Error).message
    };
  }
}

/**
 * Intelligent routing decision logic
 */
function determineProcessingStrategy(
  message: IncomingMessage, 
  isFallback: boolean
): 'graphql_full' | 'direct_fast' | 'fallback_simple' {
  
  // Fallback mode - use simple processing
  if (isFallback) {
    return 'fallback_simple';
  }
  
  // High-priority operations - use GraphQL with full audit
  if (isHighPriorityOperation(message)) {
    return 'graphql_full';
  }
  
  // Simple status updates - use direct DB for speed
  if (isSimpleStatusUpdate(message)) {
    return 'direct_fast';
  }
  
  // Default to GraphQL for unknown operations
  return 'graphql_full';
}

/**
 * Check if this is a high-priority operation requiring full audit
 */
function isHighPriorityOperation(message: IncomingMessage): boolean {
  return (
    // Patient messages
    !!message.body ||
    // Appointment-related status updates
    message.messageStatus === 'failed' ||
    // WhatsApp messages (typically more important)
    message.messageType === 'whatsapp'
  );
}

/**
 * Check if this is a simple status update
 */
function isSimpleStatusUpdate(message: IncomingMessage): boolean {
  return (
    !message.body && // Not an incoming message
    typeof message.messageStatus === 'string' && // Has status as string
    ['delivered', 'sent', 'queued'].includes(message.messageStatus.toLowerCase())
  );
}

/**
 * Process via GraphQL with full audit logging
 */
async function processViaGraphQL(message: IncomingMessage): Promise<WebhookProcessingResult> {
  try {
    if (message.body) {
      // Incoming message - use full GraphQL processing
      const result = await apolloClient.mutate({
        mutation: PROCESS_INCOMING_MESSAGE,
        variables: {
          input: {
            messageSid: message.messageSid,
            from: message.from,
            to: message.to,
            body: message.body,
            messageType: message.messageType
          }
        }
      });
      
      const processedMessage = (result.data as any)?.processIncomingMessage;
      
      return {
        success: true,
        processed_via: 'graphql',
        operation_type: 'message_received',
        message_id: processedMessage?.message?.id,
        contact_id: processedMessage?.contact?.id
      };
    } else {
      // Status update via GraphQL
      const result = await apolloClient.mutate({
        mutation: UPDATE_MESSAGE_STATUS_WEBHOOK,
        variables: {
          messageSid: message.messageSid,
          status: message.messageStatus.toUpperCase()
        }
      });
      
      return {
        success: true,
        processed_via: 'graphql',
        operation_type: 'status_update',
        message_id: (result.data as any)?.updateMessageStatus?.id
      };
    }
  } catch (error) {
    console.error('GraphQL processing failed:', error);
    throw error;
  }
}

/**
 * Process via direct DB for speed (simple operations)
 */
async function processDirectDB(message: IncomingMessage): Promise<WebhookProcessingResult> {
  try {
    // Simple status update - direct to DB
    const { error } = await supabase
      .from('crm_messages')
      .update({
        message_status: message.messageStatus.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('twilio_sid', message.messageSid);

    if (error) {
      throw error;
    }

    return {
      success: true,
      processed_via: 'direct_db',
      operation_type: 'status_update'
    };
  } catch (error) {
    console.error('Direct DB processing failed:', error);
    throw error;
  }
}

/**
 * Simplified fallback processing
 */
async function processFallback(message: IncomingMessage): Promise<WebhookProcessingResult> {
  try {
    // Store in fallback table for manual review
    const { error } = await supabase
      .from('webhook_fallback_queue')
      .insert([{
        twilio_sid: message.messageSid,
        webhook_data: message,
        processing_status: 'pending_review',
        created_at: new Date().toISOString(),
        retry_count: 0
      }]);

    if (error) {
      throw error;
    }

    // Send basic notification for critical messages
    if (message.body) {
      await supabase.from('notifications').insert([{
        type: 'webhook_fallback',
        title: 'Message Requires Manual Review',
        message: `Incoming message from ${message.from} needs manual processing`,
        read: false
      }]);
    }

    return {
      success: true,
      processed_via: 'fallback',
      operation_type: message.body ? 'message_received' : 'status_update'
    };
  } catch (error) {
    console.error('Fallback processing failed:', error);
    throw error;
  }
}

/**
 * Log critical failures for manual intervention
 */
async function logCriticalFailure(message: IncomingMessage, error: Error): Promise<void> {
  try {
    await supabase.from('webhook_critical_failures').insert([{
      twilio_sid: message.messageSid,
      webhook_data: message,
      error_message: error.message,
      error_stack: error.stack,
      created_at: new Date().toISOString(),
      requires_manual_intervention: true
    }]);

    // Send urgent notification
    await supabase.from('notifications').insert([{
      type: 'critical_webhook_failure',
      title: 'URGENT: Webhook Processing Failed',
      message: `Critical failure processing message ${message.messageSid}. Manual intervention required.`,
      read: false
    }]);
  } catch (logError) {
    console.error('Failed to log critical failure:', logError);
  }
}

/**
 * Webhook signature validation with enhanced security
 */
export function validateWebhookSecurity(
  signature: string | null,
  url: string,
  params: Record<string, any>
): { valid: boolean; reason?: string } {
  if (!signature) {
    return { valid: false, reason: 'missing_signature' };
  }

  const isValid = validateWebhookSignature(signature, url, params);
  
  return { 
    valid: isValid, 
    reason: isValid ? undefined : 'invalid_signature' 
  };
}

/**
 * Health check for webhook processing system
 */
export async function webhookHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  details: Record<string, any>;
}> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check recent failures
    const { data: recentFailures, error: failuresError } = await supabase
      .from('webhook_fallback_queue')
      .select('id')
      .gte('created_at', oneHourAgo.toISOString());

    // Check critical failures
    const { data: criticalFailures, error: criticalError } = await supabase
      .from('webhook_critical_failures')
      .select('id')
      .gte('created_at', oneHourAgo.toISOString());

    const recentFailureCount = recentFailures?.length || 0;
    const criticalFailureCount = criticalFailures?.length || 0;

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (criticalFailureCount > 0) {
      status = 'critical';
    } else if (recentFailureCount > 5) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        recent_failures: recentFailureCount,
        critical_failures: criticalFailureCount,
        last_check: now.toISOString()
      }
    };
  } catch (error) {
    return {
      status: 'critical',
      details: {
        error: (error as Error).message,
        last_check: new Date().toISOString()
      }
    };
  }
}