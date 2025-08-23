import { gql } from '@apollo/client';

/**
 * Get all contacts with optional filtering
 */
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

/**
 * Get a single contact by ID with full details including messages
 */
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

/**
 * Get contact segments for filtering and organization
 */
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