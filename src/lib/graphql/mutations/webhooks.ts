import { gql } from '@apollo/client';

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
 * Update message status via webhook with audit logging
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
 * Process webhook fallback with retry logic
 */
export const PROCESS_WEBHOOK_FALLBACK = gql`
  mutation ProcessWebhookFallback($input: WebhookFallbackInput!) {
    processWebhookFallback(input: $input) {
      success
      processedVia
      operationType
      messageId
      contactId
      requiresManualReview
      retryCount
      errors
    }
  }
`;

/**
 * Log webhook processing metrics for monitoring
 */
export const LOG_WEBHOOK_METRICS = gql`
  mutation LogWebhookMetrics($input: WebhookMetricsInput!) {
    logWebhookMetrics(input: $input) {
      success
      metricsId
      processingTime
      strategy
    }
  }
`;

/**
 * Create webhook failure notification
 */
export const CREATE_WEBHOOK_FAILURE_NOTIFICATION = gql`
  mutation CreateWebhookFailureNotification($input: WebhookFailureNotificationInput!) {
    createNotification(input: $input) {
      id
      type
      title
      message
      read
      createdAt
    }
  }
`;

/**
 * Retry failed webhook processing
 */
export const RETRY_WEBHOOK_PROCESSING = gql`
  mutation RetryWebhookProcessing($webhookId: ID!, $force: Boolean = false) {
    retryWebhookProcessing(webhookId: $webhookId, force: $force) {
      success
      result {
        processedVia
        operationType
        messageId
        contactId
      }
      errors
      retryCount
    }
  }
`;