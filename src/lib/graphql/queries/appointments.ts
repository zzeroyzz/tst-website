import { gql } from '@apollo/client';

/**
 * Get upcoming appointments with contact details
 */
export const GET_UPCOMING_APPOINTMENTS = gql`
  query GetUpcomingAppointments {
    upcomingAppointments {
      id
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
 * Get appointment summary statistics
 */
export const GET_APPOINTMENT_SUMMARY = gql`
  query GetAppointmentSummary($dateRange: DateRange) {
    appointmentSummary(dateRange: $dateRange) {
      date
      totalAppointments
      scheduledCount
      completedCount
      cancelledCount
      noShowCount
    }
  }
`;

/**
 * Get booked time slots to prevent double booking
 */
export const GET_BOOKED_SLOTS = gql`
  query GetBookedSlots($startDate: String!, $endDate: String!) {
    bookedSlots(startDate: $startDate, endDate: $endDate) {
      scheduledAt
      timeZone
    }
  }
`;

/**
 * Get appointments for a specific contact
 */
export const GET_CONTACT_APPOINTMENTS = gql`
  query GetContactAppointments($contactId: ID!) {
    contactAppointments(contactId: $contactId) {
      id
      scheduledAt
      status
      timeZone
      notes
      createdAt
      updatedAt
    }
  }
`;