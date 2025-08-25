import { GraphQLError } from 'graphql';

interface Context {
  supabase: any;
  user: any;
  session: any;
}

export const workflowResolvers = {
  Query: {
    workflows: async (_: any, __: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('crm_workflows')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new GraphQLError(`Failed to fetch workflows: ${error.message}`);
        }

        return data || [];
      } catch (error) {
        throw new GraphQLError(`Error fetching workflows: ${error}`);
      }
    },
  },

  Mutation: {
    createWorkflow: async (_: any, { input }: any, { supabase }: Context) => {
      try {
        const workflowData = {
          name: input.name,
          description: input.description,
          trigger_type: input.triggerType,
          trigger_conditions: input.triggerConditions,
          actions: input.actions,
          is_active: true,
        };

        const { data, error } = await supabase
          .from('crm_workflows')
          .insert([workflowData])
          .select()
          .single();

        if (error) {
          throw new GraphQLError(`Failed to create workflow: ${error.message}`);
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error creating workflow: ${error}`);
      }
    },

    updateWorkflow: async (
      _: any,
      { id, input }: any,
      { supabase }: Context
    ) => {
      try {
        const updateData: any = { updated_at: new Date().toISOString() };

        if (input.name) updateData.name = input.name;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.triggerType) updateData.trigger_type = input.triggerType;
        if (input.triggerConditions !== undefined)
          updateData.trigger_conditions = input.triggerConditions;
        if (input.actions !== undefined) updateData.actions = input.actions;
        if (input.isActive !== undefined) updateData.is_active = input.isActive;

        const { data, error } = await supabase
          .from('crm_workflows')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new GraphQLError(`Failed to update workflow: ${error.message}`);
        }

        return data;
      } catch (error) {
        throw new GraphQLError(`Error updating workflow: ${error}`);
      }
    },

    deleteWorkflow: async (_: any, { id }: any, { supabase }: Context) => {
      try {
        const { error } = await supabase
          .from('crm_workflows')
          .delete()
          .eq('id', id);

        if (error) {
          throw new GraphQLError(`Failed to delete workflow: ${error.message}`);
        }

        return true;
      } catch (error) {
        throw new GraphQLError(`Error deleting workflow: ${error}`);
      }
    },

    executeWorkflow: async (
      _: any,
      { workflowId, contactId }: any,
      { supabase }: Context
    ) => {
      try {
        // Get workflow details
        const { data: workflow, error: workflowError } = await supabase
          .from('crm_workflows')
          .select('*')
          .eq('id', workflowId)
          .single();

        if (workflowError || !workflow) {
          throw new GraphQLError('Workflow not found');
        }

        if (!workflow.is_active) {
          throw new GraphQLError('Workflow is not active');
        }

        // Create execution record
        const executionData = {
          workflow_id: workflowId,
          contact_id: contactId,
          status: 'PENDING',
          executed_actions: [],
        };

        const { data: execution, error: executionError } = await supabase
          .from('crm_workflow_executions')
          .insert([executionData])
          .select()
          .single();

        if (executionError) {
          throw new GraphQLError(
            `Failed to create workflow execution: ${executionError.message}`
          );
        }

        // TODO: Implement actual workflow execution logic here
        // For now, just mark as completed
        const { data: updatedExecution, error: updateError } = await supabase
          .from('crm_workflow_executions')
          .update({
            status: 'COMPLETED',
            executed_actions: workflow.actions,
          })
          .eq('id', execution.id)
          .select()
          .single();

        if (updateError) {
          throw new GraphQLError(
            `Failed to update workflow execution: ${updateError.message}`
          );
        }

        return updatedExecution;
      } catch (error) {
        throw new GraphQLError(`Error executing workflow: ${error}`);
      }
    },
  },

  Workflow: {
    triggerType: (parent: any) => parent.trigger_type,
    triggerConditions: (parent: any) => parent.trigger_conditions,
    isActive: (parent: any) => parent.is_active,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,

    executionCount: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { count, error } = await supabase
          .from('crm_workflow_executions')
          .select('*', { count: 'exact', head: true })
          .eq('workflow_id', parent.id);

        if (error) {
          console.error('Error fetching workflow execution count:', error);
          return 0;
        }

        return count || 0;
      } catch (error) {
        console.error('Error fetching workflow execution count:', error);
        return 0;
      }
    },

    lastExecuted: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('crm_workflow_executions')
          .select('executed_at')
          .eq('workflow_id', parent.id)
          .order('executed_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching workflow last executed:', error);
          return null;
        }

        return data?.executed_at || null;
      } catch (error) {
        console.error('Error fetching workflow last executed:', error);
        return null;
      }
    },
  },

  WorkflowExecution: {
    workflowId: (parent: any) => parent.workflow_id,
    contactId: (parent: any) => parent.contact_id,
    executedActions: (parent: any) => parent.executed_actions,
    errorMessage: (parent: any) => parent.error_message,
    executedAt: (parent: any) => parent.executed_at,

    workflow: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('crm_workflows')
          .select('*')
          .eq('id', parent.workflow_id)
          .single();

        if (error) {
          throw new GraphQLError(
            `Failed to fetch execution workflow: ${error.message}`
          );
        }

        return data;
      } catch (error) {
        console.error('Error fetching execution workflow:', error);
        return null;
      }
    },

    contact: async (parent: any, _: any, { supabase }: Context) => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', parent.contact_id)
          .single();

        if (error) {
          throw new GraphQLError(
            `Failed to fetch execution contact: ${error.message}`
          );
        }

        return data;
      } catch (error) {
        console.error('Error fetching execution contact:', error);
        return null;
      }
    },
  },
};
