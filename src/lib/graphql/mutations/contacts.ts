import { gql } from '@apollo/client';

/**
 * Create a new contact
 */
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

/**
 * Update an existing contact
 */
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

/**
 * Delete a contact
 */
export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id)
  }
`;

/**
 * Create a contact with appointment (used by calendar booking)
 */
export const CREATE_CONTACT_WITH_APPOINTMENT = gql`
  mutation CreateContactWithAppointment(
    $name: String!
    $email: String!
    $phoneNumber: String!
    $scheduledAt: String!
    $timeZone: String!
  ) {
    createContactWithAppointment(
      input: {
        name: $name
        email: $email
        phoneNumber: $phoneNumber
        scheduledAt: $scheduledAt
        timeZone: $timeZone
      }
    ) {
      contact {
        id
        name
        email
        phoneNumber
        contactStatus
        appointmentStatus
        scheduledAppointmentAt
      }
      appointment {
        id
        scheduledAt
        status
        timeZone
      }
      smsTriggered
      messages
    }
  }
`;

/**
 * Create a lead with appointment (alternative endpoint)
 */
export const CREATE_LEAD_WITH_APPOINTMENT = gql`
  mutation CreateLeadWithAppointment(
    $name: String!
    $email: String!
    $phone: String!
    $appointmentDateTime: String!
    $timeZone: String!
    $segments: [String!]
    $notes: String
    $triggerSMSWorkflow: Boolean
  ) {
    createLeadWithAppointment(
      input: {
        name: $name
        email: $email
        phone: $phone
        appointmentDateTime: $appointmentDateTime
        timeZone: $timeZone
        segments: $segments
        notes: $notes
        triggerSMSWorkflow: $triggerSMSWorkflow
      }
    ) {
      contact {
        id
        name
        email
        phoneNumber
        contactStatus
        appointmentStatus
        scheduledAppointmentAt
      }
      appointment {
        id
        scheduledAt
        status
        timeZone
      }
      smsTriggered
      messages
    }
  }
`;

/**
 * Update contact segments
 */
export const UPDATE_CONTACT_SEGMENTS = gql`
  mutation UpdateContactSegments($id: ID!, $segments: [String!]!) {
    updateContact(id: $id, input: { segments: $segments }) {
      id
      segments
      updatedAt
    }
  }
`;

/**
 * Create a booking contact (for booking pages)
 * Similar to CREATE_CONTACT but specifically for booking flows
 */
export const CREATE_BOOKING_CONTACT = gql`
  mutation CreateBookingContact(
    $name: String!
    $email: String!
    $phone: String!
    $source: String
    $pageUrl: String
  ) {
    createContact(
      input: {
        name: $name
        email: $email
        phoneNumber: $phone
        segments: ["Booking Page Lead"]
        crmNotes: $pageUrl
        customFields: {
          source: $source
          pageUrl: $pageUrl
          type: "booking"
        }
      }
    ) {
      id
      name
      email
      phoneNumber
      contactStatus
      segments
      createdAt
    }
  }
`;