import { GraphQLError } from 'graphql';

interface Context {
  supabase: any;
  user: any;
  session: any;
}

export const templateResolvers = {
  Query: {
    messageTemplates: async (
      _: any,
      { category }: any,
      { supabase }: Context
    ) => {
      try {
        let query = supabase.from('crm_message_templates').select('*');

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query.order('created_at', {
          ascending: false,
        });

        if (error) {
          throw new GraphQLError(`Failed to fetch templates: ${error.message}`);
        }

        return data || [];
      } catch (error) {
        throw new GraphQLError(`Error fetching templates: ${error}`);
      }
    },
  },

  Mutation: {
    createMessageTemplate: async (
      _: any,
      { input }: any,
      { supabase }: Context
    ) => {
      try {
        const templateData = {
          name: input.name,
          content: input.content,
          category: input.category,
          variables: input.variables || [],
          is_active: true,
        };

        const { data, error } = await supabase
          .from('crm_message_templates')
          .insert([templateData])
          .select()
          .single();

        if (error) {
          throw new GraphQLError(`Failed to create template: ${error.message}`);
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error creating template: ${error}`);
      }
    },

    updateMessageTemplate: async (
      _: any,
      { id, input }: any,
      { supabase }: Context
    ) => {
      try {
        const updateData: any = { updated_at: new Date().toISOString() };

        if (input.name) updateData.name = input.name;
        if (input.content) updateData.content = input.content;
        if (input.category) updateData.category = input.category;
        if (input.variables !== undefined)
          updateData.variables = input.variables;
        if (input.isActive !== undefined) updateData.is_active = input.isActive;

        const { data, error } = await supabase
          .from('crm_message_templates')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new GraphQLError(`Failed to update template: ${error.message}`);
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error updating template: ${error}`);
      }
    },

    deleteMessageTemplate: async (
      _: any,
      { id }: any,
      { supabase }: Context
    ) => {
      try {
        const { error } = await supabase
          .from('crm_message_templates')
          .delete()
          .eq('id', id);

        if (error) {
          throw new GraphQLError(`Failed to delete template: ${error.message}`);
        }

        return true;
      } catch (error) {
        throw new GraphQLError(`Error deleting template: ${error}`);
      }
    },
  },

  MessageTemplate: {
    isActive: (parent: any) => parent.is_active,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,

    usageCount: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { count, error } = await supabase
          .from('crm_messages')
          .select('*', { count: 'exact', head: true })
          .eq('template_id', parent.id);

        if (error) {
          console.error('Error fetching template usage count:', error);
          return 0;
        }

        return count || 0;
      } catch (error) {
        console.error('Error fetching template usage count:', error);
        return 0;
      }
    },

    lastUsed: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('crm_messages')
          .select('created_at')
          .eq('template_id', parent.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching template last used:', error);
          return null;
        }

        return data?.created_at || null;
      } catch (error) {
        console.error('Error fetching template last used:', error);
        return null;
      }
    },
  },
};
