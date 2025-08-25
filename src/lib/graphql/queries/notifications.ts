import { gql } from '@apollo/client';

/**
 * Get unread notifications for dashboard display
 */
export const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications($limit: Int = 50) {
    unreadNotifications(limit: $limit) {
      id
      type
      title
      message
      contactId
      contactName
      contactEmail
      createdAt
    }
  }
`;

/**
 * Get notification summary statistics
 */
export const GET_NOTIFICATION_SUMMARY = gql`
  query GetNotificationSummary {
    notificationSummary {
      totalNotifications
      unreadCount
      todayCount
      weekCount
      recentNotifications {
        id
        type
        title
        message
        createdAt
      }
    }
  }
`;

/**
 * Get all notifications with pagination
 */
export const GET_ALL_NOTIFICATIONS = gql`
  query GetAllNotifications($limit: Int, $offset: Int, $read: Boolean) {
    notifications(limit: $limit, offset: $offset, read: $read) {
      id
      type
      title
      message
      contactId
      contactName
      contactEmail
      read
      createdAt
    }
  }
`;