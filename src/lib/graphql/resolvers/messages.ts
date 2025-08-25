import { GraphQLError } from 'graphql';
import { sendSMS, sendWhatsApp } from '@/lib/twilio/client';

interface Context {
  supabase: any;
  user: any;
  session: any;
}

export const messageResolvers = {
  Query: {
    messages: async (
      _: any,
      { contactId, limit = 50, offset = 0 }: any,
      { supabase }: Context
    ) => {
      try {
        const { data: messages, error: messagesError } = await supabase
          .from('crm_messages')
          .select('*')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (messagesError) {
          throw new GraphQLError(
            `Failed to fetch messages: ${messagesError.message}`
          );
        }

        const { count, error: countError } = await supabase
          .from('crm_messages')
          .select('*', { count: 'exact', head: true })
          .eq('contact_id', contactId);

        if (countError) {
          throw new GraphQLError(
            `Failed to fetch message count: ${countError.message}`
          );
        }

        return {
          messages: messages || [],
          hasMore: offset + limit < (count || 0),
          total: count || 0,
        };
      } catch (error) {
        throw new GraphQLError(`Error fetching messages: ${error}`);
      }
    },
  },

  Mutation: {
    sendMessage: async (_: any, { input }: any, { supabase }: Context) => {
      try {
        // Get contact details
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .select('name, email, phone_number')
          .eq('id', input.contactId)
          .single();

        if (contactError || !contact) {
          throw new GraphQLError('Contact not found');
        }

        if (!contact.phone_number) {
          throw new GraphQLError('Contact has no phone number');
        }

        let content = input.content;
        let templateId = input.templateId;

        // If using a template, process variables
        if (input.templateId) {
          const { data: template, error: templateError } = await supabase
            .from('crm_message_templates')
            .select('*')
            .eq('id', input.templateId)
            .single();

          if (templateError || !template) {
            throw new GraphQLError('Template not found');
          }

          content = template.content;

          // Replace template variables
          if (input.templateVariables) {
            Object.entries(input.templateVariables).forEach(([key, value]) => {
              content = content.replace(
                new RegExp(`{{${key}}}`, 'g'),
                value as string
              );
            });
          }

          // Replace common variables
          content = content.replace(/{{name}}/g, contact.name);
          content = content.replace(/{{email}}/g, contact.email);
        }

        // Create message record
        const messageData = {
          contact_id: input.contactId,
          content,
          direction: 'OUTBOUND',
          message_status: 'QUEUED',
          message_type: input.messageType,
          template_id: templateId,
        };

        const { data: message, error: messageError } = await supabase
          .from('crm_messages')
          .insert([messageData])
          .select()
          .single();

        if (messageError) {
          throw new GraphQLError(
            `Failed to create message record: ${messageError.message}`
          );
        }

        try {
          // Update message status to sending
          await supabase
            .from('crm_messages')
            .update({ message_status: 'SENDING' })
            .eq('id', message.id);

          // Send via Twilio
          let twilioResponse;
          if (input.messageType === 'SMS') {
            twilioResponse = await sendSMS(contact.phone_number, content);
          } else if (input.messageType === 'WHATSAPP') {
            twilioResponse = await sendWhatsApp(contact.phone_number, content);
          } else {
            throw new Error('Unsupported message type');
          }

          // Update message with success status
          const { data: updatedMessage, error: updateError } = await supabase
            .from('crm_messages')
            .update({
              message_status: 'SENT',
              twilio_sid: twilioResponse.sid,
            })
            .eq('id', message.id)
            .select()
            .single();

          if (updateError) {
            throw new GraphQLError(
              `Failed to update message status: ${updateError.message}`
            );
          }

          return updatedMessage;
        } catch (twilioError) {
          // Update message with error status
          await supabase
            .from('crm_messages')
            .update({
              message_status: 'FAILED',
              error_message: (twilioError as Error).message,
            })
            .eq('id', message.id);

          throw new GraphQLError(
            `Failed to send message: ${(twilioError as Error).message}`
          );
        }
      } catch (error) {
        throw new GraphQLError(`Error sending message: ${error}`);
      }
    },
  },

  Subscription: {
    messageReceived: {
      // Placeholder for real-time message subscriptions
      subscribe: async () => {
        throw new GraphQLError('Subscriptions not yet implemented');
      },
    },
  },

  Message: {
    contactId: (parent: any) => parent.contact_id,
    messageStatus: (parent: any) => parent.message_status,
    messageType: (parent: any) => parent.message_type,
    twilioSid: (parent: any) => parent.twilio_sid,
    errorMessage: (parent: any) => parent.error_message,
    templateId: (parent: any) => parent.template_id,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,

    contact: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', parent.contact_id)
          .single();

        if (error) {
          throw new GraphQLError(
            `Failed to fetch message contact: ${error.message}`
          );
        }

        return data;
      } catch (error) {
        console.error('Error fetching message contact:', error);
        return null;
      }
    },

    template: async (parent: any, _: any, { supabase }: Context) => {
      if (!parent.template_id) return null;

      try {
        const { data, error } = await supabase
          .from('crm_message_templates')
          .select('*')
          .eq('id', parent.template_id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new GraphQLError(
            `Failed to fetch message template: ${error.message}`
          );
        }

        return data;
      } catch (error) {
        console.error('Error fetching message template:', error);
        return null;
      }
    },
  },
};
