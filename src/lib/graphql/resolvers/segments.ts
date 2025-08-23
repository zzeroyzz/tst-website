import { GraphQLError } from 'graphql';

interface Context {
  supabase: any;
  user: any;
  session: any;
}

export const segmentResolvers = {
  Query: {
    contactSegments: async (_: any, __: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('crm_contact_segments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new GraphQLError(
            `Failed to fetch contact segments: ${error.message}`
          );
        }

        return data || [];
      } catch (error) {
        throw new GraphQLError(`Error fetching contact segments: ${error}`);
      }
    },
  },

  Mutation: {
    createContactSegment: async (
      _: any,
      { input }: any,
      { supabase }: Context
    ) => {
      try {
        const segmentData = {
          name: input.name,
          description: input.description,
          color: input.color,
        };

        const { data, error } = await supabase
          .from('crm_contact_segments')
          .insert([segmentData])
          .select()
          .single();

        if (error) {
          throw new GraphQLError(
            `Failed to create contact segment: ${error.message}`
          );
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error creating contact segment: ${error}`);
      }
    },

    updateContactSegment: async (
      _: any,
      { id, input }: any,
      { supabase }: Context
    ) => {
      try {
        const updateData: any = {};

        if (input.name) updateData.name = input.name;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.color) updateData.color = input.color;

        const { data, error } = await supabase
          .from('crm_contact_segments')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new GraphQLError(
            `Failed to update contact segment: ${error.message}`
          );
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error updating contact segment: ${error}`);
      }
    },

    deleteContactSegment: async (
      _: any,
      { id }: any,
      { supabase }: Context
    ) => {
      try {
        const { error } = await supabase
          .from('crm_contact_segments')
          .delete()
          .eq('id', id);

        if (error) {
          throw new GraphQLError(
            `Failed to delete contact segment: ${error.message}`
          );
        }

        return true;
      } catch (error) {
        throw new GraphQLError(`Error deleting contact segment: ${error}`);
      }
    },
  },

  ContactSegment: {
    createdAt: (parent: any) => parent.created_at,

    contactCount: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { count, error } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .contains('segments', [parent.name]);

        if (error) {
          console.error('Error fetching segment contact count:', error);
          return 0;
        }

        return count || 0;
      } catch (error) {
        console.error('Error fetching segment contact count:', error);
        return 0;
      }
    },
  },
};
