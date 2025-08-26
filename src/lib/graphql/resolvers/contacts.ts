import { GraphQLError } from 'graphql';
import { getContactConfirmationTemplate } from '@/lib/custom-email-templates';
import { Resend } from 'resend';

interface Context {
  supabase: any;
  user: any;
  session: any;
}

export const contactResolvers = {
  Query: {
    contacts: async (_: any, { filters }: any, { supabase }: Context) => {
      try {
        let query = supabase.from('contacts').select(`
            *,
            user_id,
            uuid,
            message_count,
            last_message_at,
            contact_status,
            segments,
            crm_notes,
            custom_fields
          `);

        // Apply filters
        if (filters) {
          if (filters.status) {
            query = query.eq('contact_status', filters.status);
          }
          if (filters.segments && filters.segments.length > 0) {
            query = query.overlaps('segments', filters.segments);
          }
          if (filters.hasMessages !== undefined) {
            if (filters.hasMessages) {
              query = query.gt('message_count', 0);
            } else {
              query = query.eq('message_count', 0);
            }
          }
          if (filters.appointmentStatus) {
            query = query.eq('appointment_status', filters.appointmentStatus);
          }
          if (filters.search) {
            query = query.or(
              `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
            );
          }
          if (filters.createdAfter) {
            query = query.gte('created_at', filters.createdAfter);
          }
          if (filters.createdBefore) {
            query = query.lte('created_at', filters.createdBefore);
          }
        }

        const { data, error } = await query.order('created_at', {
          ascending: false,
        });

        if (error) {
          throw new GraphQLError(`Failed to fetch contacts: ${error.message}`);
        }

        return data || [];
      } catch (error) {
        throw new GraphQLError(`Error fetching contacts: ${error}`);
      }
    },

    contact: async (_: any, { id }: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select(
            `
            *,
            user_id,
            uuid,
            message_count,
            last_message_at,
            contact_status,
            segments,
            crm_notes,
            custom_fields
          `
          )
          .eq('id', id)
          .single();

        if (error) {
          throw new GraphQLError(`Failed to fetch contact: ${error.message}`);
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error fetching contact: ${error}`);
      }
    },

    contactsWithMessages: async (_: any, { limit = 50 }: any, { supabase }: Context) => {
      try {
        let query = supabase.from('contacts').select(`
            *,
            user_id,
            uuid,
            message_count,
            last_message_at,
            contact_status,
            segments,
            crm_notes,
            custom_fields
          `);

        // Get all contacts first, we'll sort them after adding last message info
        // Note: We need to get more than the limit to properly sort by last message

        const { data, error } = await query;

        if (error) {
          throw new GraphQLError(`Failed to fetch contacts with messages: ${error.message}`);
        }

        // Get last message content for each contact
        const contactsWithLastMessage = await Promise.all(
          (data || []).map(async (contact) => {
            let lastMessage = null;
            try {
              // Always try contact_id first since that's what we're currently using for messages
              const { data: messageData, error: messageError } = await supabase
                .from('crm_messages')
                .select('content')
                .eq('contact_id', contact.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              if (!messageError && messageData) {
                lastMessage = messageData.content;
              }
            } catch (error) {
              // No messages found, leave as null
            }
            
            return {
              ...contact,
              lastMessage,
              unreadMessageCount: 0, // TODO: implement read status tracking
            };
          })
        );

        // Sort contacts: those with messages (by last_message_at desc) first, then others by created_at desc
        const sortedContacts = contactsWithLastMessage.sort((a, b) => {
          // If both have lastMessageAt, sort by it (newest first)
          if (a.last_message_at && b.last_message_at) {
            return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
          }
          // If only one has lastMessageAt, it goes first
          if (a.last_message_at && !b.last_message_at) return -1;
          if (!a.last_message_at && b.last_message_at) return 1;
          // If neither has messages, sort by created_at (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        // Apply limit after sorting
        const limitedContacts = sortedContacts.slice(0, limit);

        return {
          contacts: limitedContacts,
          hasMore: sortedContacts.length > limit,
          total: sortedContacts.length,
        };
      } catch (error) {
        throw new GraphQLError(`Error fetching contacts with messages: ${error}`);
      }
    },
  },

  Mutation: {
    createContact: async (_: any, { input }: any, { supabase }: Context) => {
      try {
        // Check for existing contact first
        const { data: existingContact, error: checkError } = await supabase
          .from('contacts')
          .select('id, email, name')
          .eq('email', input.email.toLowerCase())
          .single();

        if (existingContact) {
          throw new GraphQLError(
            'An account with this email already exists. Please contact care@toastedsesametherapy.com directly for assistance.'
          );
        }

        // If there's an error other than "no rows found", handle it
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Database check error:', checkError);
          throw new GraphQLError('Failed to check existing contacts');
        }

        const contactData = {
          name: input.name,
          email: input.email.toLowerCase(),
          phone_number: input.phoneNumber,
          phone: input.phoneNumber, // legacy compatibility
          contact_status: 'ACTIVE',
          appointment_status: null,
          segments: input.segments || [],
          crm_notes: input.crmNotes,
          custom_fields: input.customFields || {},
          archived: false,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('contacts')
          .insert([contactData])
          .select(`
            id,
            uuid,
            name,
            email,
            phone_number,
            contact_status,
            segments,
            crm_notes,
            created_at,
            updated_at,
            last_message_at,
            message_count,
            custom_fields
          `)
          .single();

        if (error) {
          // Handle unique constraint violations gracefully
          if (error.code === '23505') {
            throw new GraphQLError(
              'An account with this email already exists. Please contact care@toastedsesametherapy.com directly for assistance.'
            );
          }
          throw new GraphQLError(`Failed to create contact: ${error.message}`);
        }

        // Send welcome email if requested
        if (input.sendWelcomeEmail) {
          try {
            const RESEND_API_KEY = process.env.RESEND_API_KEY;
            if (RESEND_API_KEY) {
              const resend = new Resend(RESEND_API_KEY);
              const EMAIL_FROM = process.env.EMAIL_FROM || 'Toasted Sesame <kato@toastedsesametherapy.com>';
              
              const emailTemplate = getContactConfirmationTemplate({
                name: input.name,
              });
              
              await resend.emails.send({
                from: EMAIL_FROM,
                to: [input.email],
                subject: 'Thanks for reaching out! Next steps inside 📝',
                html: emailTemplate,
              });
            }
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // don't throw – contact creation succeeded
          }
        }

        // Create notification for admin dashboard
        try {
          await supabase.from('notifications').insert({
            type: 'contact',
            title: 'New Contact Submission',
            message: `${input.name} submitted the contact form via GraphQL`,
            contact_id: data.id,
            contact_uuid: data.uuid,
            contact_name: input.name,
            contact_email: input.email.toLowerCase(),
            read: false,
            created_at: new Date().toISOString(),
          });
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
          // don't throw – contact creation succeeded
        }

        return data;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(`Error creating contact: ${error}`);
      }
    },

    updateContact: async (
      _: any,
      { id, input }: any,
      { supabase }: Context
    ) => {
      try {
        const updateData: any = {};

        if (input.name) updateData.name = input.name;
        if (input.email) updateData.email = input.email.toLowerCase();
        if (input.phoneNumber !== undefined)
          updateData.phone_number = input.phoneNumber;
        if (input.contactStatus)
          updateData.contact_status = input.contactStatus;
        if (input.segments !== undefined) updateData.segments = input.segments;
        if (input.crmNotes !== undefined) updateData.crm_notes = input.crmNotes;
        if (input.appointmentStatus !== undefined)
          updateData.appointment_status = input.appointmentStatus;
        if (input.customFields !== undefined)
          updateData.custom_fields = input.customFields;

        const { data, error } = await supabase
          .from('contacts')
          .update(updateData)
          .eq('id', id)
          .select(`
            id,
            uuid,
            name,
            email,
            phone_number,
            contact_status,
            segments,
            crm_notes,
            created_at,
            updated_at,
            last_message_at,
            message_count,
            custom_fields
          `)
          .single();

        if (error) {
          throw new GraphQLError(`Failed to update contact: ${error.message}`);
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error updating contact: ${error}`);
      }
    },

    deleteContact: async (_: any, { id }: any, { supabase }: Context) => {
      try {
        const { error } = await supabase.from('contacts').delete().eq('id', id);

        if (error) {
          throw new GraphQLError(`Failed to delete contact: ${error.message}`);
        }

        return true;
      } catch (error) {
        throw new GraphQLError(`Error deleting contact: ${error}`);
      }
    },

    createContactWithAppointment: async (
      _: any,
      { input }: any,
      { supabase }: Context
    ) => {
      try {
        const {
          name,
          email,
          phoneNumber,
          scheduledAt,
          timeZone,
          segments = ['New Lead'],
          notes,
          triggerSMSWorkflow = true,
        } = input;

        const messages: string[] = [];

        // Check if contact already exists
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id, name, email')
          .eq('email', email.toLowerCase())
          .single();

        let contact;
        if (existingContact) {
          // Update existing contact
          const { data: updatedContact, error: updateError } = await supabase
            .from('contacts')
            .update({
              phone_number: phoneNumber,
              segments,
              crm_notes: notes || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingContact.id)
            .select(`
              id,
              uuid,
              user_id,
              name,
              email,
              phone_number,
              contact_status,
              segments,
              crm_notes,
              created_at,
              updated_at,
              last_message_at,
              message_count,
              custom_fields
            `)
            .single();

          if (updateError) {
            throw new GraphQLError(
              `Failed to update existing contact: ${updateError.message}`
            );
          }

          contact = updatedContact;
          messages.push(`Updated existing contact: ${name}`);
        } else {
          // Create new contact
          const contactData = {
            name,
            email: email.toLowerCase(),
            phone_number: phoneNumber,
            contact_status: 'PROSPECT',
            appointment_status: null, // Explicitly set to null
            segments,
            crm_notes: notes || null,
            custom_fields: {},
            archived: false,
          };

          const { data: newContact, error: contactError } = await supabase
            .from('contacts')
            .insert([contactData])
            .select(`
              id,
              uuid,
              user_id,
              name,
              email,
              phone_number,
              contact_status,
              segments,
              crm_notes,
              created_at,
              updated_at,
              last_message_at,
              message_count,
              custom_fields
            `)
            .single();

          if (contactError) {
            throw new GraphQLError(
              `Failed to create contact: ${contactError.message}`
            );
          }

          contact = newContact;
          messages.push(`Created new contact: ${name}`);
        }

        // Create appointment
        const appointmentData = {
          contact_id: contact.id,
          contact_uuid: contact.uuid,
          scheduled_at: scheduledAt,
          status: 'SCHEDULED',
          time_zone: timeZone,
          notes: `Initial consultation scheduled via calendar form`,
        };

        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select(
            'id, contact_id, contact_uuid, scheduled_at, status, time_zone, created_at, updated_at'
          )
          .single();

        if (appointmentError) {
          throw new GraphQLError(
            `Failed to create appointment: ${appointmentError.message}`
          );
        }

        // Update contact with appointment information
        const { error: contactUpdateError } = await supabase
          .from('contacts')
          .update({
            scheduled_appointment_at: scheduledAt,
            appointment_status: 'SCHEDULED',
          })
          .eq('id', contact.id);

        if (contactUpdateError) {
          throw new GraphQLError(
            `Failed to update contact with appointment info: ${contactUpdateError.message}`
          );
        }

        messages.push(
          `Scheduled appointment for ${new Date(scheduledAt).toLocaleString()}`
        );

        let smsTriggered = false;

        // Trigger SMS workflow if enabled and phone number provided
        if (triggerSMSWorkflow && phoneNumber) {
          try {
            const { executeNewLeadSMSWorkflow } = await import(
              '@/lib/sms/workflows'
            );

            const workflowResult = await executeNewLeadSMSWorkflow({
              contactId: contact.id,
              contactName: name,
              contactEmail: email,
              phoneNumber: phoneNumber,
              appointmentDateTime: scheduledAt,
            });

            smsTriggered = workflowResult.success;
            messages.push(...workflowResult.messages);

            if (workflowResult.errors.length > 0) {
              messages.push(
                ...workflowResult.errors.map((err) => `SMS Error: ${err}`)
              );
            }
          } catch (smsError) {
            console.error('Error executing SMS workflow:', smsError);
            messages.push(
              `SMS workflow failed: ${(smsError as Error).message}`
            );
          }
        }

        // Create notification for dashboard
        await supabase.from('notifications').insert([
          {
            type: 'appointment',
            title: 'New Consultation Scheduled',
            message: `${name} scheduled a consultation for ${new Date(
              scheduledAt
            ).toLocaleString()}`,
            contact_id: contact.id,
            contact_uuid: contact.uuid,
            contact_name: name,
            contact_email: email,
            read: false,
          },
        ]);

        return {
          contact,
          appointment,
          smsTriggered,
          messages,
        };
      } catch (error) {
        throw new GraphQLError(
          `Error creating contact with appointment: ${error}`
        );
      }
    },

    createLeadWithAppointment: async (
      _: any,
      { input }: any,
      { supabase }: Context
    ) => {
      try {
        const {
          name,
          email,
          phone,
          appointmentDateTime,
          timeZone,
          segments = ['New Lead'],
          notes,
          triggerSMSWorkflow = true,
        } = input;

        const messages: string[] = [];

        // Check if contact already exists
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id, name, email')
          .eq('email', email.toLowerCase())
          .single();

        let contact;
        if (existingContact) {
          // Update existing contact
          const { data: updatedContact, error: updateError } = await supabase
            .from('contacts')
            .update({
              phone_number: phone,
              segments,
              crm_notes: notes || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingContact.id)
            .select(`
              id,
              uuid,
              user_id,
              name,
              email,
              phone_number,
              contact_status,
              segments,
              crm_notes,
              created_at,
              updated_at,
              last_message_at,
              message_count,
              custom_fields
            `)
            .single();

          if (updateError) {
            throw new GraphQLError(
              `Failed to update existing contact: ${updateError.message}`
            );
          }

          contact = updatedContact;
          messages.push(`Updated existing contact: ${name}`);
        } else {
          // Create new contact
          const contactData = {
            name,
            email: email.toLowerCase(),
            phone_number: phone,
            contact_status: 'PROSPECT',
            appointment_status: null, // Will be updated after appointment creation
            segments: [...(segments || []), 'new'], // Always add 'new' tag
            crm_notes: notes || null,
            custom_fields: {},
            archived: false,
          };

          const { data: newContact, error: contactError } = await supabase
            .from('contacts')
            .insert([contactData])
            .select(`
              id,
              uuid,
              user_id,
              name,
              email,
              phone_number,
              contact_status,
              segments,
              crm_notes,
              created_at,
              updated_at,
              last_message_at,
              message_count,
              custom_fields
            `)
            .single();

          if (contactError) {
            throw new GraphQLError(
              `Failed to create contact: ${contactError.message}`
            );
          }

          contact = newContact;
          messages.push(`Created new contact: ${name}`);
        }

        // Create appointment
        const appointmentData = {
          contact_id: contact.id,
          contact_uuid: contact.uuid,
          scheduled_at: appointmentDateTime,
          status: 'SCHEDULED',
          time_zone: timeZone,
          notes: `Initial consultation scheduled via calendar form`,
        };

        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select(
            'id, contact_id, contact_uuid, scheduled_at, status, time_zone, created_at, updated_at'
          )
          .single();

        if (appointmentError) {
          throw new GraphQLError(
            `Failed to create appointment: ${appointmentError.message}`
          );
        }

        // Update contact with appointment information
        const { error: contactUpdateError } = await supabase
          .from('contacts')
          .update({
            scheduled_appointment_at: appointmentDateTime,
            appointment_status: 'SCHEDULED',
          })
          .eq('id', contact.id);

        if (contactUpdateError) {
          throw new GraphQLError(
            `Failed to update contact with appointment info: ${contactUpdateError.message}`
          );
        }

        messages.push(
          `Scheduled appointment for ${new Date(
            appointmentDateTime
          ).toLocaleString()}`
        );

        let smsTriggered = false;

        // Trigger SMS workflow if enabled and phone number provided
        if (triggerSMSWorkflow && phone) {
          try {
            const { executeNewLeadSMSWorkflow } = await import(
              '@/lib/sms/workflows'
            );

            const workflowResult = await executeNewLeadSMSWorkflow({
              contactId: contact.id,
              contactName: name,
              contactEmail: email,
              phoneNumber: phone,
              appointmentDateTime,
            });

            smsTriggered = workflowResult.success;
            messages.push(...workflowResult.messages);

            if (workflowResult.errors.length > 0) {
              messages.push(
                ...workflowResult.errors.map((err) => `SMS Error: ${err}`)
              );
            }
          } catch (smsError) {
            console.error('Error executing SMS workflow:', smsError);
            messages.push(
              `SMS workflow failed: ${(smsError as Error).message}`
            );
          }
        }

        // Send appointment emails (client confirmation + admin notification)
        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-appointment-emails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'APPOINTMENT_BOOKED',
              clientName: name,
              clientEmail: email,
              clientPhone: phone,
              appointmentDate: new Date(appointmentDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              appointmentTime: new Date(appointmentDateTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: timeZone,
              }),
              appointmentDateTime,
              variant: segments.includes('nd Booking Lead') ? 'nd' : segments.includes('affirming Booking Lead') ? 'affirming' : 'trauma',
              uuid: contact.uuid, // Use contact UUID for cancellation
              contactId: contact.id, // For notification creation
              contactUuid: contact.uuid, // For notification creation
            }),
          });

          if (emailResponse.ok) {
            const emailResult = await emailResponse.json();
            if (emailResult.clientEmailSent) {
              messages.push('Client confirmation email sent');
            }
            if (emailResult.adminEmailSent) {
              messages.push('Admin notification email sent');
            }
            if (emailResult.errors?.length > 0) {
              messages.push(...emailResult.errors.map((err: string) => `Email error: ${err}`));
            }
          } else {
            messages.push('Email sending failed - but appointment was created successfully');
          }
        } catch (emailError) {
          console.error('Error sending appointment emails:', emailError);
          messages.push('Email sending failed - but appointment was created successfully');
        }

        return {
          contact,
          appointment,
          smsTriggered,
          messages,
        };
      } catch (error) {
        throw new GraphQLError(
          `Error creating lead with appointment: ${error}`
        );
      }
    },
  },

  Subscription: {
    contactUpdated: {
      // Placeholder – would require real-time subscriptions
      subscribe: async () => {
        throw new GraphQLError('Subscriptions not yet implemented');
      },
    },
  },

  Contact: {
    user_id: (parent: any) => parent.user_id,
    contactStatus: (parent: any) => parent.contact_status || 'ACTIVE',
    phoneNumber: (parent: any) => parent.phone_number,
    crmNotes: (parent: any) => parent.crm_notes,
    customFields: (parent: any) => parent.custom_fields || {},
    lastMessageAt: (parent: any) => parent.last_message_at,
    messageCount: (parent: any) => parent.message_count || 0,
    segments: (parent: any) => parent.segments || [],

    // Computed fields
    messages: async (
      parent: any,
      { limit = 10 }: any,
      { supabase }: Context
    ) => {
      try {
        const { data, error } = await supabase
          .from('crm_messages')
          .select('*')
          .eq('contact_uuid', parent.uuid)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw new GraphQLError(
            `Failed to fetch contact messages: ${error.message}`
          );
        }

        return data || [];
      } catch (error) {
        console.error('Error fetching contact messages:', error);
        return [];
      }
    },

    lastMessage: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('crm_messages')
          .select('*')
          .eq('contact_uuid', parent.uuid)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          throw new GraphQLError(
            `Failed to fetch last message: ${error.message}`
          );
        }

        return data;
      } catch (error) {
        console.error('Error fetching last message:', error);
        return null;
      }
    },

    messagesSent: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { count, error } = await supabase
          .from('crm_messages')
          .select('*', { count: 'exact', head: true })
          .eq('contact_uuid', parent.uuid)
          .eq('direction', 'OUTBOUND');

        if (error) {
          console.error('Error fetching sent message count:', error);
          return 0;
        }

        return count || 0;
      } catch (error) {
        console.error('Error fetching sent message count:', error);
        return 0;
      }
    },

    messagesReceived: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { count, error } = await supabase
          .from('crm_messages')
          .select('*', { count: 'exact', head: true })
          .eq('contact_uuid', parent.uuid)
          .eq('direction', 'INBOUND');

        if (error) {
          console.error('Error fetching received message count:', error);
          return 0;
        }

        return count || 0;
      } catch (error) {
        console.error('Error fetching received message count:', error);
        return 0;
      }
    },
  },

  Appointment: {
    contactId: (parent: any) => parent.contact_id,
    scheduledAt: (parent: any) => parent.scheduled_at,
    timeZone: (parent: any) => parent.time_zone,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,

    contact: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('uuid', parent.contact_uuid)
          .single();

        if (error) {
          throw new GraphQLError(
            `Failed to fetch appointment contact: ${error.message}`
          );
        }

        return data;
      } catch (error) {
        console.error('Error fetching appointment contact:', error);
        return null;
      }
    },
  },

  LeadAppointmentResult: {
    // All fields are already properly named, no field resolvers needed
  },
};
