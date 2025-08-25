import { gql } from '@apollo/client';

/**
 * Create a new workflow
 */
export const CREATE_WORKFLOW = gql`
  mutation CreateWorkflow($input: CreateWorkflowInput!) {
    createWorkflow(input: $input) {
      id
      name
      description
      triggerType
      triggerConditions
      actions
      isActive
      createdAt
    }
  }
`;

/**
 * Update an existing workflow
 */
export const UPDATE_WORKFLOW = gql`
  mutation UpdateWorkflow($id: ID!, $input: UpdateWorkflowInput!) {
    updateWorkflow(id: $id, input: $input) {
      id
      name
      description
      triggerType
      triggerConditions
      actions
      isActive
      updatedAt
    }
  }
`;

/**
 * Delete a workflow
 */
export const DELETE_WORKFLOW = gql`
  mutation DeleteWorkflow($id: ID!) {
    deleteWorkflow(id: $id)
  }
`;

/**
 * Execute a workflow manually
 */
export const EXECUTE_WORKFLOW = gql`
  mutation ExecuteWorkflow($workflowId: ID!, $contactId: ID!) {
    executeWorkflow(workflowId: $workflowId, contactId: $contactId) {
      id
      status
      executedActions
      executedAt
      workflow {
        id
        name
      }
      contact {
        id
        name
      }
    }
  }
`;

/**
 * Toggle workflow active status
 */
export const TOGGLE_WORKFLOW_STATUS = gql`
  mutation ToggleWorkflowStatus($id: ID!, $isActive: Boolean!) {
    updateWorkflow(id: $id, input: { isActive: $isActive }) {
      id
      isActive
      updatedAt
    }
  }
`;

/**
 * Test workflow execution (dry run)
 */
export const TEST_WORKFLOW = gql`
  mutation TestWorkflow($workflowId: ID!, $contactId: ID!) {
    testWorkflow(workflowId: $workflowId, contactId: $contactId) {
      success
      actions
      messages
      errors
    }
  }
`;