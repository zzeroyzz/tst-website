/**
 * Enhanced Twilio Webhook Handler with Optimal Architecture
 * Features: Intelligent routing, fallback processing, audit integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  processWebhook, 
  validateWebhookSecurity,
  type WebhookProcessingResult 
} from '@/lib/twilio/webhook-processor';
import { parseIncomingMessage, type IncomingMessage } from '@/lib/twilio/client';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for metrics
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let processingResult: WebhookProcessingResult | null = null;
  let incomingMessage: IncomingMessage | null = null;
  
  try {
    // Parse request body
    const body = await request.text();
    const params = new URLSearchParams(body);
    const bodyParams = Object.fromEntries(params.entries());
    
    // Parse incoming message
    incomingMessage = parseIncomingMessage(bodyParams);
    
    // Enhanced security validation
    const signature = request.headers.get('x-twilio-signature');
    const url = request.url;
    const securityCheck = validateWebhookSecurity(signature, url, bodyParams);
    
    if (!securityCheck.valid) {
      await logSecurityFailure(incomingMessage, securityCheck.reason);
      return NextResponse.json(
        { error: 'Security validation failed' }, 
        { status: 401 }
      );
    }
    
    console.log('Processing Twilio webhook:', {
      messageSid: incomingMessage.messageSid,
      type: incomingMessage.body ? 'incoming_message' : 'status_update',
      from: incomingMessage.from
    });
    
    // Process webhook with intelligent routing
    processingResult = await processWebhook(incomingMessage, false);
    
    // If primary processing suggests fallback, trigger fallback
    if (processingResult.fallback_required) {
      console.log('Primary processing failed, triggering fallback...');
      
      // Trigger fallback endpoint asynchronously
      triggerFallbackProcessing(incomingMessage);
      
      // Return success to Twilio to prevent retries
      return createTwiMLResponse();
    }
    
    // Log metrics for monitoring
    await logWebhookMetrics(incomingMessage, processingResult, startTime);
    
    if (!processingResult.success) {
      console.error('Webhook processing failed:', processingResult.error);
      return NextResponse.json(
        { error: 'Processing failed' }, 
        { status: 500 }
      );
    }
    
    console.log('Webhook processed successfully:', {
      strategy: processingResult.processed_via,
      operationType: processingResult.operation_type,
      messageId: processingResult.message_id,
      contactId: processingResult.contact_id
    });
    
    return createTwiMLResponse();
    
  } catch (error) {
    console.error('Critical webhook error:', error);
    
    // Log critical failure
    if (incomingMessage) {
      await logCriticalWebhookFailure(incomingMessage, error as Error);
    }
    
    // Log failed metrics
    if (incomingMessage) {
      await logWebhookMetrics(incomingMessage, {
        success: false,
        processed_via: 'direct_db',
        operation_type: 'unknown',
        error: (error as Error).message
      }, startTime);
    }
    
    return NextResponse.json(
      { error: 'Critical processing error' }, 
      { status: 500 }
    );
  }
}

/**
 * Trigger fallback processing asynchronously
 */
async function triggerFallbackProcessing(message: IncomingMessage): Promise<void> {
  try {
    // Make async request to fallback endpoint
    const fallbackUrl = new URL('/api/twilio/webhook-fallback', process.env.NEXT_PUBLIC_APP_URL!);
    
    fetch(fallbackUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true'
      },
      body: JSON.stringify({ message })
    }).catch(error => {
      console.error('Fallback processing trigger failed:', error);
    });
    
  } catch (error) {
    console.error('Error triggering fallback processing:', error);
  }
}

/**
 * Log security failures for monitoring
 */
async function logSecurityFailure(
  message: IncomingMessage, 
  reason?: string
): Promise<void> {
  try {
    await supabase.from('webhook_critical_failures').insert([{
      twilio_sid: message.messageSid,
      webhook_data: message,
      error_message: `Security validation failed: ${reason}`,
      failure_type: 'security_error',
      requires_manual_intervention: true
    }]);
  } catch (error) {
    console.error('Failed to log security failure:', error);
  }
}

/**
 * Log webhook processing metrics
 */
async function logWebhookMetrics(
  message: IncomingMessage,
  result: WebhookProcessingResult,
  startTime: number
): Promise<void> {
  try {
    const processingTime = Date.now() - startTime;
    
    await supabase.from('webhook_processing_metrics').insert([{
      twilio_sid: message.messageSid,
      processing_strategy: result.processed_via === 'graphql' ? 'graphql_full' : 
                          result.processed_via === 'direct_db' ? 'direct_fast' : 'fallback_simple',
      operation_type: result.operation_type,
      processing_time_ms: processingTime,
      success: result.success,
      error_message: result.error,
      retry_attempt: 0
    }]);
  } catch (error) {
    console.error('Failed to log webhook metrics:', error);
  }
}

/**
 * Log critical webhook failures
 */
async function logCriticalWebhookFailure(
  message: IncomingMessage, 
  error: Error
): Promise<void> {
  try {
    await supabase.from('webhook_critical_failures').insert([{
      twilio_sid: message.messageSid,
      webhook_data: message,
      error_message: error.message,
      error_stack: error.stack,
      failure_type: 'processing_error',
      requires_manual_intervention: true
    }]);
    
    // Create urgent notification
    await supabase.from('notifications').insert([{
      type: 'critical_webhook_failure',
      title: 'URGENT: Webhook Processing Failed',
      message: `Critical failure processing ${message.body ? 'incoming message' : 'status update'} from ${message.from}`,
      read: false
    }]);
  } catch (logError) {
    console.error('Failed to log critical failure:', logError);
  }
}

/**
 * Create TwiML response for Twilio
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
 * GET method for webhook URL verification and health check
 */
export async function GET(request: NextRequest) {
  try {
    // Check if this is a health check request
    const url = new URL(request.url);
    if (url.searchParams.get('health') === 'check') {
      
      // Perform system health check
      const { data: healthData, error } = await supabase
        .rpc('webhook_system_health_check');
      
      if (error) {
        throw error;
      }
      
      const overallStatus = healthData?.some((metric: any) => metric.status === 'critical') 
        ? 'critical' 
        : healthData?.some((metric: any) => metric.status === 'warning') 
        ? 'warning' 
        : 'healthy';
      
      return NextResponse.json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        metrics: healthData,
        version: 'enhanced-v1.0'
      });
    }
    
    // Default verification response
    return NextResponse.json({ 
      message: 'Enhanced Twilio webhook endpoint',
      version: 'v1.0',
      features: [
        'intelligent_routing',
        'fallback_processing', 
        'audit_integration',
        'performance_monitoring'
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}