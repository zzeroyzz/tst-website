import { GraphQLError } from 'graphql';
import { createClient } from '@supabase/supabase-js';
import type { IncomingMessage } from '@/lib/twilio/client';

interface Context {
  supabase: any;
  user: any;
  session: any;
}

// Server-side Supabase client for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const webhookResolvers = {
  Mutation: {
    processIncomingMessage: async (
      _: any,
      { input }: { input: ProcessIncomingMessageInput },
      { supabase }: Context
    ) => {
      try {
        const { messageSid, from, to, body, messageType } = input;

        // Find or create contact
        let contact: any = null;
        let isNewContact = false;

        const { data: existingContact } = await supabase
          .from('contacts')
          .select('*')
          .eq('phone_number', from)
          .single();

        if (existingContact) {
          contact = existingContact;
        } else {
          // Create new contact
          const { data: newContact, error: createError } = await supabase
            .from('contacts')
            .insert([
              {
                name: `Contact ${from}`,
                email: `${from.replace(/\D/g, '')}@unknown.com`,
                phone_number: from,
                contact_status: 'ACTIVE',
                segments: ['Unknown'],
                archived: false,
                crm_notes: 'Auto-created from incoming message',
              },
            ])
            .select()
            .single();

          if (createError) {
            throw new GraphQLError(`Failed to create contact: ${createError.message}`);
          }

          contact = newContact;
          isNewContact = true;
        }

        if (!contact) {
          throw new GraphQLError('Contact not found or created');
        }

        // Create message record
        const { data: message, error: messageError } = await supabase
          .from('crm_messages')
          .insert([
            {
              contact_id: contact.id,
              content: body,
              direction: 'INBOUND',
              message_status: 'RECEIVED',
              message_type: messageType.toUpperCase(),
              twilio_sid: messageSid,
            },
          ])
          .select()
          .single();

        if (messageError) {
          throw new GraphQLError(`Failed to create message: ${messageError.message}`);
        }

        // Update contact's last message timestamp
        await supabase
          .from('contacts')
          .update({
            last_message_at: new Date().toISOString(),
            message_count: (contact.message_count || 0) + 1,
          })
          .eq('id', contact.id);

        // Create notification
        let notificationCreated = false;
        try {
          await supabase.from('notifications').insert([
            {
              type: 'message_received',
              title: 'New Message Received',
              message: `${contact.name} sent: "${body.substring(0, 50)}${body.length > 50 ? '...' : ''}"`,
              contact_id: contact.id,
              contact_name: contact.name,
              contact_email: contact.email,
              read: false,
            },
          ]);
          notificationCreated = true;
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
        }

        return {
          message,
          contact,
          isNewContact,
          notificationCreated,
          errors: [],
        };
      } catch (error) {
        throw new GraphQLError(`Error processing incoming message: ${error}`);
      }
    },

    updateMessageStatus: async (
      _: any,
      { messageSid, status, errorMessage }: { messageSid: string; status: string; errorMessage?: string }
    ) => {
      try {
        const { data: updatedMessage, error } = await supabaseAdmin
          .from('crm_messages')
          .update({
            message_status: status.toUpperCase(),
            error_message: errorMessage || null,
            updated_at: new Date().toISOString(),
          })
          .eq('twilio_sid', messageSid)
          .select(`
            *,
            contact:contacts(id, name)
          `)
          .single();

        if (error) {
          throw new GraphQLError(`Failed to update message status: ${error.message}`);
        }

        return updatedMessage;
      } catch (error) {
        throw new GraphQLError(`Error updating message status: ${error}`);
      }
    },

    processWebhookFallback: async (
      _: any,
      { input }: { input: WebhookFallbackInput }
    ) => {
      try {
        const { webhookData, retryCount = 0 } = input;
        
        // Store in fallback queue for manual review
        const { data: fallbackRecord, error } = await supabaseAdmin
          .from('webhook_fallback_queue')
          .insert([
            {
              twilio_sid: webhookData.messageSid,
              webhook_data: webhookData,
              processing_status: 'pending_review',
              retry_count: retryCount,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) {
          throw new GraphQLError(`Failed to create fallback record: ${error.message}`);
        }

        // Create notification for critical messages
        let requiresManualReview = false;
        if (webhookData.body) {
          await supabaseAdmin.from('notifications').insert([
            {
              type: 'webhook_fallback',
              title: 'Message Requires Manual Review',
              message: `Incoming message from ${webhookData.from} needs manual processing`,
              read: false,
            },
          ]);
          requiresManualReview = true;
        }

        return {
          success: true,
          processedVia: 'fallback',
          operationType: webhookData.body ? 'message_received' : 'status_update',
          requiresManualReview,
          retryCount: retryCount + 1,
          errors: [],
        };
      } catch (error) {
        throw new GraphQLError(`Error processing webhook fallback: ${error}`);
      }
    },

    retryWebhookProcessing: async (
      _: any,
      { webhookId, force = false }: { webhookId: string; force?: boolean }
    ) => {
      try {
        // Get the fallback record
        const { data: fallbackRecord, error: fetchError } = await supabaseAdmin
          .from('webhook_fallback_queue')
          .select('*')
          .eq('id', webhookId)
          .single();

        if (fetchError || !fallbackRecord) {
          throw new GraphQLError('Webhook record not found');
        }

        if (fallbackRecord.retry_count >= 3 && !force) {
          throw new GraphQLError('Maximum retry attempts exceeded. Use force=true to override.');
        }

        const webhookData = fallbackRecord.webhook_data as IncomingMessage;
        
        // Process the webhook data
        let result;
        if (webhookData.body) {
          // Incoming message - process via GraphQL
          result = await webhookResolvers.Mutation.processIncomingMessage(
            _,
            {
              input: {
                messageSid: webhookData.messageSid,
                from: webhookData.from,
                to: webhookData.to,
                body: webhookData.body,
                messageType: webhookData.messageType,
              },
            },
            { supabase: supabaseAdmin, user: null, session: null }
          );
        } else {
          // Status update
          result = await webhookResolvers.Mutation.updateMessageStatus(
            _,
            {
              messageSid: webhookData.messageSid,
              status: webhookData.messageStatus,
            }
          );
        }

        // Update fallback record as completed
        await supabaseAdmin
          .from('webhook_fallback_queue')
          .update({
            processing_status: 'completed',
            retry_count: fallbackRecord.retry_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', webhookId);

        return {
          success: true,
          result: {
            processedVia: 'graphql',
            operationType: webhookData.body ? 'message_received' : 'status_update',
            messageId: result.id,
            contactId: result.contact?.id || result.contact_id,
          },
          errors: [],
          retryCount: fallbackRecord.retry_count + 1,
        };
      } catch (error) {
        // Update fallback record as failed
        await supabaseAdmin
          .from('webhook_fallback_queue')
          .update({
            processing_status: 'failed',
            error_message: (error as Error).message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', webhookId);

        throw new GraphQLError(`Error retrying webhook processing: ${error}`);
      }
    },

    logWebhookMetrics: async (
      _: any,
      { input }: { input: WebhookMetricsInput }
    ) => {
      try {
        const {
          twilioSid,
          processingStrategy,
          operationType,
          processingTimeMs,
          success,
          errorMessage,
          retryAttempt = 0,
        } = input;

        const { data: metricsRecord, error } = await supabaseAdmin
          .from('webhook_processing_metrics')
          .insert([
            {
              twilio_sid: twilioSid,
              processing_strategy: processingStrategy,
              operation_type: operationType,
              processing_time_ms: processingTimeMs,
              success,
              error_message: errorMessage,
              retry_attempt: retryAttempt,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) {
          throw new GraphQLError(`Failed to log webhook metrics: ${error.message}`);
        }

        return {
          success: true,
          metricsId: metricsRecord.id,
          processingTime: processingTimeMs,
          strategy: processingStrategy,
        };
      } catch (error) {
        throw new GraphQLError(`Error logging webhook metrics: ${error}`);
      }
    },
  },
};

// TypeScript interfaces for the resolvers
interface ProcessIncomingMessageInput {
  messageSid: string;
  from: string;
  to: string;
  body: string;
  messageType: string;
}

interface WebhookFallbackInput {
  webhookData: IncomingMessage;
  retryCount?: number;
}

interface WebhookMetricsInput {
  twilioSid: string;
  processingStrategy: string;
  operationType: string;
  processingTimeMs: number;
  success: boolean;
  errorMessage?: string;
  retryAttempt?: number;
}