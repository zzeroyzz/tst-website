import { gql } from '@apollo/client';

/**
 * Mark a notification as read
 */
export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
      updatedAt
    }
  }
`;

/**
 * Mark multiple notifications as read
 */
export const MARK_NOTIFICATIONS_READ = gql`
  mutation MarkNotificationsRead($ids: [ID!]!) {
    markNotificationsRead(ids: $ids) {
      successCount
      failureCount
      updatedNotifications {
        id
        read
      }
    }
  }
`;

/**
 * Mark all notifications as read
 */
export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      successCount
      failureCount
    }
  }
`;

/**
 * Delete a notification
 */
export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

/**
 * Delete multiple notifications
 */
export const DELETE_NOTIFICATIONS = gql`
  mutation DeleteNotifications($ids: [ID!]!) {
    deleteNotifications(ids: $ids) {
      successCount
      failureCount
    }
  }
`;

/**
 * Create a custom notification
 */
export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
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