import { gql } from '@apollo/client';

/**
 * Create a new appointment
 */
export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      id
      contactId
      scheduledAt
      status
      timeZone
      notes
      createdAt
      contact {
        id
        name
        email
        phoneNumber
      }
    }
  }
`;

/**
 * Update an existing appointment
 */
export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {
    updateAppointment(id: $id, input: $input) {
      id
      contactId
      scheduledAt
      status
      timeZone
      notes
      updatedAt
      contact {
        id
        name
        email
        phoneNumber
      }
    }
  }
`;

/**
 * Cancel an appointment
 */
export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($id: ID!, $reason: String) {
    cancelAppointment(id: $id, reason: $reason) {
      id
      status
      notes
      updatedAt
    }
  }
`;

/**
 * Reschedule an appointment
 */
export const RESCHEDULE_APPOINTMENT = gql`
  mutation RescheduleAppointment($id: ID!, $newScheduledAt: String!, $timeZone: String!) {
    rescheduleAppointment(id: $id, newScheduledAt: $newScheduledAt, timeZone: $timeZone) {
      id
      scheduledAt
      timeZone
      status
      updatedAt
      contact {
        id
        name
        email
        phoneNumber
      }
    }
  }
`;

/**
 * Mark appointment as completed
 */
export const COMPLETE_APPOINTMENT = gql`
  mutation CompleteAppointment($id: ID!, $notes: String) {
    completeAppointment(id: $id, notes: $notes) {
      id
      status
      notes
      updatedAt
    }
  }
`;

/**
 * Mark appointment as no-show
 */
export const MARK_NO_SHOW = gql`
  mutation MarkNoShow($id: ID!, $notes: String) {
    markNoShow(id: $id, notes: $notes) {
      id
      status
      notes
      updatedAt
    }
  }
`;