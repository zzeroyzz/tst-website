import { gql } from '@apollo/client';

/**
 * Get messages for a specific contact with pagination
 */
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

/**
 * Get comprehensive message statistics for dashboard analytics
 */
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

/**
 * Get message templates by category
 */
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