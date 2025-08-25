import { gql } from '@apollo/client';

/**
 * Get comprehensive dashboard data in a single query
 */
export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    messageStats {
      totalSent
      totalReceived
      totalContacts
      deliveryRate
      responseRate
      sentToday
      receivedToday
    }
    notificationSummary {
      totalNotifications
      unreadCount
      todayCount
      weekCount
    }
    upcomingAppointments {
      id
      scheduledAt
      status
      timeZone
      contact {
        id
        name
        email
        phoneNumber
      }
    }
    recentContacts: contacts(filters: { limit: 10, orderBy: "created_at" }) {
      id
      name
      email
      phoneNumber
      contactStatus
      createdAt
      lastMessageAt
      messageCount
    }
  }
`;

/**
 * Get dashboard overview statistics
 */
export const GET_DASHBOARD_OVERVIEW = gql`
  query GetDashboardOverview($dateRange: String) {
    overview(dateRange: $dateRange) {
      totalContacts
      activeContacts
      totalAppointments
      completedAppointments
      messagesSent
      messagesReceived
      responseRate
      conversionRate
      trendsData {
        date
        contacts
        appointments
        messages
      }
    }
  }
`;