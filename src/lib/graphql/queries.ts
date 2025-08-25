/**
 * @deprecated This file has been reorganized for better maintainability.
 * Please use the new modular structure:
 * - Query files: @/lib/graphql/queries/
 * - Mutation files: @/lib/graphql/mutations/
 * - Hooks: @/lib/graphql/hooks/
 * 
 * This file will be removed in a future version.
 */

import { gql } from '@apollo/client';

// Contact Queries
export const GET_CONTACTS = gql`
  query GetContacts($filters: ContactFilters) {
    contacts(filters: $filters) {
      id
      name
      email
      phoneNumber
      contactStatus
      segments
      notes
      crmNotes
      createdAt
      lastMessageAt
      messageCount
      questionnaireCompleted
      scheduledAppointmentAt
      appointmentStatus
      messagesSent
      messagesReceived
      lastMessage {
        id
        content
        direction
        createdAt
      }
    }
  }
`;

export const GET_CONTACT = gql`
  query GetContact($id: ID!) {
    contact(id: $id) {
      id
      name
      email
      phoneNumber
      contactStatus
      segments
      notes
      crmNotes
      createdAt
      updatedAt
      lastMessageAt
      messageCount
      customFields
      questionnaireCompleted
      questionnaireCompletedAt
      scheduledAppointmentAt
      appointmentStatus
      status
      messagesSent
      messagesReceived
      messages(limit: 50) {
        id
        content
        direction
        messageStatus
        messageType
        createdAt
        twilioSid
        errorMessage
        template {
          id
          name
          category
        }
      }
    }
  }
`;

// Message Queries
export const GET_MESSAGES = gql`
  query GetMessages($contactId: ID!, $limit: Int, $offset: Int) {
    messages(contactId: $contactId, limit: $limit, offset: $offset) {
      messages {
        id
        content
        direction
        messageStatus
        messageType
        createdAt
        updatedAt
        twilioSid
        errorMessage
        contact {
          id
          name
          email
        }
        template {
          id
          name
          category
        }
      }
      hasMore
      total
    }
  }
`;

// Template Queries
export const GET_MESSAGE_TEMPLATES = gql`
  query GetMessageTemplates($category: TemplateCategory) {
    messageTemplates(category: $category) {
      id
      name
      content
      category
      variables
      isActive
      createdAt
      updatedAt
      usageCount
      lastUsed
    }
  }
`;

// Stats Query
export const GET_MESSAGE_STATS = gql`
  query GetMessageStats {
    messageStats {
      totalSent
      totalReceived
      totalContacts
      deliveryRate
      responseRate
      sentToday
      receivedToday
      dailyStats {
        date
        sent
        received
        delivered
      }
    }
  }
`;

// Segment Queries
export const GET_CONTACT_SEGMENTS = gql`
  query GetContactSegments {
    contactSegments {
      id
      name
      description
      color
      createdAt
      contactCount
    }
  }
`;

// Workflow Queries
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

// Contact Mutations
export const CREATE_CONTACT = gql`
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
      id
      name
      email
      phoneNumber
      contactStatus
      segments
      crmNotes
      createdAt
    }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
    updateContact(id: $id, input: $input) {
      id
      name
      email
      phoneNumber
      contactStatus
      segments
      crmNotes
      updatedAt
    }
  }
`;

export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id)
  }
`;

// Message Mutations
export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      direction
      messageStatus
      messageType
      createdAt
      twilioSid
      errorMessage
      contact {
        id
        name
        email
      }
    }
  }
`;

// Template Mutations
export const CREATE_MESSAGE_TEMPLATE = gql`
  mutation CreateMessageTemplate($input: CreateMessageTemplateInput!) {
    createMessageTemplate(input: $input) {
      id
      name
      content
      category
      variables
      isActive
      createdAt
    }
  }
`;

export const UPDATE_MESSAGE_TEMPLATE = gql`
  mutation UpdateMessageTemplate(
    $id: ID!
    $input: UpdateMessageTemplateInput!
  ) {
    updateMessageTemplate(id: $id, input: $input) {
      id
      name
      content
      category
      variables
      isActive
      updatedAt
    }
  }
`;

export const DELETE_MESSAGE_TEMPLATE = gql`
  mutation DeleteMessageTemplate($id: ID!) {
    deleteMessageTemplate(id: $id)
  }
`;

// Segment Mutations
export const CREATE_CONTACT_SEGMENT = gql`
  mutation CreateContactSegment($input: CreateContactSegmentInput!) {
    createContactSegment(input: $input) {
      id
      name
      description
      color
      createdAt
    }
  }
`;

export const UPDATE_CONTACT_SEGMENT = gql`
  mutation UpdateContactSegment($id: ID!, $input: UpdateContactSegmentInput!) {
    updateContactSegment(id: $id, input: $input) {
      id
      name
      description
      color
    }
  }
`;

export const DELETE_CONTACT_SEGMENT = gql`
  mutation DeleteContactSegment($id: ID!) {
    deleteContactSegment(id: $id)
  }
`;

// Workflow Mutations
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

export const DELETE_WORKFLOW = gql`
  mutation DeleteWorkflow($id: ID!) {
    deleteWorkflow(id: $id)
  }
`;

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
