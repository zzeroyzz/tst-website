import { gql } from '@apollo/client';

/**
 * Get all workflows with execution statistics
 */
export const GET_WORKFLOWS = gql`
  query GetWorkflows {
    workflows {
      id
      name
      description
      triggerType
      triggerConditions
      actions
      isActive
      createdAt
      updatedAt
      executionCount
      lastExecuted
    }
  }
`;

/**
 * Get workflow execution history
 */
export const GET_WORKFLOW_EXECUTIONS = gql`
  query GetWorkflowExecutions($workflowId: ID, $contactId: ID, $limit: Int) {
    workflowExecutions(workflowId: $workflowId, contactId: $contactId, limit: $limit) {
      id
      status
      executedActions
      errorMessage
      executedAt
      workflow {
        id
        name
      }
      contact {
        id
        name
        email
      }
    }
  }
`;