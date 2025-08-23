import { GraphQLError } from 'graphql';

interface Context {
  supabase: any;
  user: any;
  session: any;
}

export const notificationResolvers = {
  Query: {
    notifications: async (
      _: any, 
      { limit = 50, unreadOnly = false }: any, 
      { supabase }: Context
    ) => {
      try {
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (unreadOnly) {
          query = query.eq('read', false);
        }

        const { data, error } = await query;

        if (error) {
          throw new GraphQLError(`Failed to fetch notifications: ${error.message}`);
        }

        return data || [];
      } catch (error) {
        throw new GraphQLError(`Error fetching notifications: ${error}`);
      }
    },

    unreadNotificationCount: async (_: any, __: any, { supabase }: Context) => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('read', false);

        if (error) {
          throw new GraphQLError(`Failed to count unread notifications: ${error.message}`);
        }

        return count || 0;
      } catch (error) {
        throw new GraphQLError(`Error counting unread notifications: ${error}`);
      }
    },
  },

  Mutation: {
    markNotificationRead: async (_: any, { id }: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .update({
            read: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new GraphQLError(`Failed to mark notification as read: ${error.message}`);
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error marking notification as read: ${error}`);
      }
    },

    markNotificationsRead: async (_: any, { ids }: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .update({
            read: true,
            updated_at: new Date().toISOString()
          })
          .in('id', ids)
          .select();

        if (error) {
          throw new GraphQLError(`Failed to mark notifications as read: ${error.message}`);
        }

        return {
          successCount: data?.length || 0,
          failureCount: Math.max(0, ids.length - (data?.length || 0)),
          updatedNotifications: data || []
        };
      } catch (error) {
        throw new GraphQLError(`Error marking notifications as read: ${error}`);
      }
    },

    markAllNotificationsRead: async (_: any, __: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .update({
            read: true,
            updated_at: new Date().toISOString()
          })
          .eq('read', false)
          .select();

        if (error) {
          throw new GraphQLError(`Failed to mark all notifications as read: ${error.message}`);
        }

        return {
          successCount: data?.length || 0,
          failureCount: 0
        };
      } catch (error) {
        throw new GraphQLError(`Error marking all notifications as read: ${error}`);
      }
    },

    deleteNotification: async (_: any, { id }: any, { supabase }: Context) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id);

        if (error) {
          throw new GraphQLError(`Failed to delete notification: ${error.message}`);
        }

        return true;
      } catch (error) {
        throw new GraphQLError(`Error deleting notification: ${error}`);
      }
    },

    deleteNotifications: async (_: any, { ids }: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .delete()
          .in('id', ids)
          .select();

        if (error) {
          throw new GraphQLError(`Failed to delete notifications: ${error.message}`);
        }

        return {
          successCount: data?.length || 0,
          failureCount: Math.max(0, ids.length - (data?.length || 0))
        };
      } catch (error) {
        throw new GraphQLError(`Error deleting notifications: ${error}`);
      }
    },

    createNotification: async (_: any, { input }: any, { supabase }: Context) => {
      try {
        const notificationData = {
          type: input.type,
          title: input.title,
          message: input.message,
          contact_id: input.contactId || null,
          contact_name: input.contactName || null,
          contact_email: input.contactEmail || null,
          read: false,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('notifications')
          .insert([notificationData])
          .select()
          .single();

        if (error) {
          throw new GraphQLError(`Failed to create notification: ${error.message}`);
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error creating notification: ${error}`);
      }
    },
  },

  Notification: {
    contactId: (parent: any) => parent.contact_id,
    contactName: (parent: any) => parent.contact_name,
    contactEmail: (parent: any) => parent.contact_email,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,

    contact: async (parent: any, _: any, { supabase }: Context) => {
      if (!parent.contact_id) return null;
      
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', parent.contact_id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new GraphQLError(`Failed to fetch notification contact: ${error.message}`);
        }

        return data;
      } catch (error) {
        console.error('Error fetching notification contact:', error);
        return null;
      }
    },
  },
};