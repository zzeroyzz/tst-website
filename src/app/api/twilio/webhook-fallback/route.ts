/**
 * Twilio Webhook Fallback Handler
 * Simplified processing for when primary webhook fails
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  processWebhook,
  type WebhookProcessingResult 
} from '@/lib/twilio/webhook-processor';
import { parseIncomingMessage, type IncomingMessage } from '@/lib/twilio/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check if this is an internal fallback request
    const isInternalRequest = request.headers.get('X-Internal-Request') === 'true';
    
    let incomingMessage: IncomingMessage;
    
    if (isInternalRequest) {
      // Internal request from primary webhook
      const body = await request.json();
      incomingMessage = body.message;
    } else {
      // Direct Twilio request (configured as fallback URL in Twilio)
      const body = await request.text();
      const params = new URLSearchParams(body);
      const bodyParams = Object.fromEntries(params.entries());
      incomingMessage = parseIncomingMessage(bodyParams);
    }
    
    console.log('Processing webhook fallback:', {
      messageSid: incomingMessage.messageSid,
      type: incomingMessage.body ? 'incoming_message' : 'status_update',
      isInternal: isInternalRequest
    });
    
    // Process with fallback strategy
    const processingResult = await processWebhook(incomingMessage, true);
    
    // Log fallback metrics
    await logFallbackMetrics(incomingMessage, processingResult, startTime, isInternalRequest);
    
    if (processingResult.success) {
      console.log('Fallback processing successful:', {
        strategy: processingResult.processed_via,
        operationType: processingResult.operation_type
      });
    } else {
      console.error('Fallback processing failed:', processingResult.error);
      
      // Create high-priority notification for fallback failure
      await createFallbackFailureNotification(incomingMessage, processingResult.error);
    }
    
    // Always return success to Twilio to prevent further retries
    return createTwiMLResponse();
    
  } catch (error) {
    console.error('Critical fallback error:', error);
    
    // This is critical - both primary and fallback failed
    await logCriticalFallbackFailure(error as Error);
    
    return createTwiMLResponse(); // Still return success to stop Twilio retries
  }
}

/**
 * Log fallback processing metrics
 */
async function logFallbackMetrics(
  message: IncomingMessage,
  result: WebhookProcessingResult,
  startTime: number,
  isInternal: boolean
): Promise<void> {
  try {
    const processingTime = Date.now() - startTime;
    
    await supabase.from('webhook_processing_metrics').insert([{
      twilio_sid: message.messageSid,
      processing_strategy: 'fallback_simple',
      operation_type: result.operation_type,
      processing_time_ms: processingTime,
      success: result.success,
      error_message: result.error,
      retry_attempt: isInternal ? 1 : 0 // Internal = first retry, Direct = Twilio retry
    }]);
  } catch (error) {
    console.error('Failed to log fallback metrics:', error);
  }
}

/**
 * Create notification for fallback failures
 */
async function createFallbackFailureNotification(
  message: IncomingMessage,
  error?: string
): Promise<void> {
  try {
    await supabase.from('notifications').insert([{
      type: 'webhook_fallback_failed',
      title: 'Webhook Fallback Failed',
      message: `Fallback processing failed for message ${message.messageSid}. Error: ${error}`,
      read: false
    }]);
  } catch (logError) {
    console.error('Failed to create fallback failure notification:', logError);
  }
}

/**
 * Log when both primary and fallback fail
 */
async function logCriticalFallbackFailure(error: Error): Promise<void> {
  try {
    await supabase.from('webhook_critical_failures').insert([{
      twilio_sid: 'unknown',
      webhook_data: { error: 'fallback_system_failure' },
      error_message: `Fallback system failure: ${error.message}`,
      error_stack: error.stack,
      failure_type: 'system_error',
      requires_manual_intervention: true
    }]);
    
    // Create urgent notification
    await supabase.from('notifications').insert([{
      type: 'system_critical_failure',
      title: 'CRITICAL: Webhook System Failure',
      message: 'Both primary and fallback webhook processing have failed. Immediate attention required.',
      read: false
    }]);
  } catch (logError) {
    console.error('Failed to log critical fallback failure:', logError);
  }
}

/**
 * Create TwiML response
 */
function createTwiMLResponse(): NextResponse {
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response></Response>`;
  
  return new NextResponse(twimlResponse, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' }
  });
}

/**
 * Manual retry endpoint for fallback queue processing
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'process_queue') {
      return await processFailureQueue();
    } else if (action === 'health') {
      return await getFallbackHealth();
    }
    
    return NextResponse.json({ 
      message: 'Twilio webhook fallback endpoint',
      actions: ['process_queue', 'health']
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Fallback endpoint error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Process items in fallback queue (manual trigger)
 */
async function processFailureQueue(): Promise<NextResponse> {
  try {
    // Get next items from fallback queue
    const { data: queueItems, error } = await supabase
      .rpc('get_next_fallback_item', { assigned_user: 'system' });
    
    if (error) {
      throw error;
    }
    
    if (!queueItems?.length) {
      return NextResponse.json({ 
        message: 'No items in fallback queue',
        processed: 0
      });
    }
    
    let processed = 0;
    let failed = 0;
    
    for (const item of queueItems) {
      try {
        const message = item.webhook_data as IncomingMessage;
        const result = await processWebhook(message, true);
        
        // Mark item as completed/failed
        await supabase.rpc('complete_fallback_item', {
          item_id: item.id,
          success: result.success,
          error_msg: result.error
        });
        
        if (result.success) {
          processed++;
        } else {
          failed++;
        }
      } catch (itemError) {
        console.error(`Failed to process fallback item ${item.id}:`, itemError);
        
        await supabase.rpc('complete_fallback_item', {
          item_id: item.id,
          success: false,
          error_msg: (itemError as Error).message
        });
        
        failed++;
      }
    }
    
    return NextResponse.json({
      message: 'Fallback queue processed',
      processed,
      failed,
      total: queueItems.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Queue processing failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Get fallback system health
 */
async function getFallbackHealth(): Promise<NextResponse> {
  try {
    const { data: queueCount, error: queueError } = await supabase
      .from('webhook_fallback_queue')
      .select('id', { count: 'exact', head: true })
      .eq('processing_status', 'pending_review');
    
    const { data: criticalCount, error: criticalError } = await supabase
      .from('webhook_critical_failures')
      .select('id', { count: 'exact', head: true })
      .eq('requires_manual_intervention', true);
    
    if (queueError || criticalError) {
      throw new Error('Health check query failed');
    }
    
    const queueSize = (queueCount as any)?.count || 0;
    const criticalIssues = (criticalCount as any)?.count || 0;
    
    let status = 'healthy';
    if (criticalIssues > 0) {
      status = 'critical';
    } else if (queueSize > 20) {
      status = 'degraded';
    }
    
    return NextResponse.json({
      status,
      fallback_queue_size: queueSize,
      critical_issues: criticalIssues,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}