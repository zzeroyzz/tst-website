import { gql } from '@apollo/client';

/**
 * Send a message to a contact
 */
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

/**
 * Create a new message template
 */
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

/**
 * Update an existing message template
 */
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

/**
 * Delete a message template
 */
export const DELETE_MESSAGE_TEMPLATE = gql`
  mutation DeleteMessageTemplate($id: ID!) {
    deleteMessageTemplate(id: $id)
  }
`;

/**
 * Send bulk messages to multiple contacts
 */
export const SEND_BULK_MESSAGES = gql`
  mutation SendBulkMessages($input: SendBulkMessagesInput!) {
    sendBulkMessages(input: $input) {
      successCount
      failureCount
      messages {
        id
        contactId
        messageStatus
        errorMessage
      }
    }
  }
`;

/**
 * Update message status (for delivery confirmations)
 */
export const UPDATE_MESSAGE_STATUS = gql`
  mutation UpdateMessageStatus($id: ID!, $status: MessageStatus!, $errorMessage: String) {
    updateMessageStatus(id: $id, status: $status, errorMessage: $errorMessage) {
      id
      messageStatus
      errorMessage
      updatedAt
    }
  }
`;

/**
 * Update message status by Twilio SID (for webhook updates)
 */
export const UPDATE_MESSAGE_STATUS_WEBHOOK = gql`
  mutation UpdateMessageStatus(
    $messageSid: String!
    $status: MessageStatus!
    $errorMessage: String
  ) {
    updateMessageStatus(
      messageSid: $messageSid
      status: $status
      errorMessage: $errorMessage
    ) {
      id
      messageStatus
      errorMessage
      updatedAt
      contact {
        id
        name
      }
    }
  }
`;

/**
 * Process incoming message via GraphQL with full audit
 */
export const PROCESS_INCOMING_MESSAGE = gql`
  mutation ProcessIncomingMessage($input: ProcessIncomingMessageInput!) {
    processIncomingMessage(input: $input) {
      message {
        id
        content
        direction
        messageStatus
        messageType
        twilioSid
        createdAt
      }
      contact {
        id
        name
        email
        phoneNumber
        contactStatus
      }
      isNewContact
      notificationCreated
      errors
    }
  }
`;

/**
 * Send message using template
 */
export const SEND_MESSAGE_FROM_TEMPLATE = gql`
  mutation SendMessageFromTemplate($input: SendMessageFromTemplateInput!) {
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
        phoneNumber
      }
    }
  }
`;