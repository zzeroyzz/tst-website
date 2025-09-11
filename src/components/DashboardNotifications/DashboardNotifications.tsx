/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/DashboardNotifications/DashboardNotifications.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Users, CheckSquare, Calendar, Mail, Bell } from 'lucide-react';
import styles from './DashboardNotifications.module.css';

interface DashboardNotificationsProps {
  user: any;
  onNotificationClick: (notification: any) => void;
}

const DashboardNotifications: React.FC<DashboardNotificationsProps> = ({
  user,
  onNotificationClick,
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<number>(10000); // Start with 10 seconds
  const noActivityCountRef = useRef<number>(0);
  const supabase = createClientComponentClient();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async (showNewNotificationAlert = false) => {
    try {
      const response = await fetch('/api/dashboard/notifications?limit=50');
      const data = await response.json();

      if (response.ok) {
        const newNotifications = data.notifications || [];
        const newUnreadCount = data.unreadCount || 0;

        // Check for new notifications since last fetch
        if (
          showNewNotificationAlert &&
          lastFetchTime &&
          notifications.length > 0
        ) {
          const newNotificationsSinceLastFetch = newNotifications.filter(
            (notification: any) => {
              const notificationTime = new Date(notification.created_at);
              return notificationTime > lastFetchTime && !notification.read;
            }
          );

          // Reset activity counter if new notifications found
          if (newNotificationsSinceLastFetch.length > 0) {
            noActivityCountRef.current = 0;
          }

          // Show browser notification for new notifications
          if (
            newNotificationsSinceLastFetch.length > 0 &&
            Notification.permission === 'granted'
          ) {
            newNotificationsSinceLastFetch.forEach((notification: any) => {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: `notification-${notification.id}`,
                silent: false,
              });
            });
          }

          // Show visual indicator for new notifications
          if (newNotificationsSinceLastFetch.length > 0) {
            console.log(
              `🔔 ${newNotificationsSinceLastFetch.length} new notification(s) received`
            );
          }
        }

        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
        setLastFetchTime(new Date());

        if (isLoading) {
          setIsLoading(false);
        }

        return true; // Indicate successful fetch
      } else {
        console.error('Error fetching notifications:', data.error);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Adaptive polling function
  const adaptivePolling = async () => {
    const success = await fetchNotifications(true);

    if (success) {
      // If no new notifications for a while, slow down polling
      noActivityCountRef.current++;

      const maxInterval = 60000; // Max 1 minute
      if (
        noActivityCountRef.current > 6 &&
        pollIntervalRef.current < maxInterval
      ) {
        pollIntervalRef.current = Math.min(
          pollIntervalRef.current * 1.5,
          maxInterval
        );
        console.log(
          `📡 Slowing down polling to ${pollIntervalRef.current / 1000}s`
        );

        // Restart interval with new timing
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = setInterval(
            adaptivePolling,
            pollIntervalRef.current
          );
        }
      }
    }
  };

  // Speed up polling when user is active
  const handleUserActivity = () => {
    if (pollIntervalRef.current > 10000) {
      pollIntervalRef.current = 10000;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = setInterval(
          adaptivePolling,
          pollIntervalRef.current
        );
      }
      console.log('🏃 User active - speeding up polling');
    }
    noActivityCountRef.current = 0; // Reset activity counter
  };

  // Set up polling for new notifications
  useEffect(() => {
    // Initial fetch
    fetchNotifications(false);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Start adaptive polling
    pollingIntervalRef.current = setInterval(
      adaptivePolling,
      pollIntervalRef.current
    );

    // Listen for user activity to speed up polling
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Fast polling when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications(true);
        handleUserActivity(); // Reset to fast polling
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  // Update timeAgo every minute for existing notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev =>
        prev.map(notification => {
          const createdAt = new Date(notification.created_at);
          const now = new Date();
          const diffInMinutes = Math.floor(
            (now.getTime() - createdAt.getTime()) / (1000 * 60)
          );

          let timeAgo;
          if (diffInMinutes < 1) timeAgo = 'Just now';
          else if (diffInMinutes < 60) timeAgo = `${diffInMinutes}m ago`;
          else {
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) timeAgo = `${diffInHours}h ago`;
            else {
              const diffInDays = Math.floor(diffInHours / 24);
              if (diffInDays < 7) timeAgo = `${diffInDays}d ago`;
              else timeAgo = createdAt.toLocaleDateString();
            }
          }

          return { ...notification, timeAgo };
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isNotificationOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isNotificationOpen) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNotificationOpen]);

  // Refresh notifications when dropdown is opened
  const handleNotificationToggle = () => {
    if (!isNotificationOpen) {
      fetchNotifications(false); // Refresh when opening
      handleUserActivity(); // Speed up polling
    }
    setIsNotificationOpen(!isNotificationOpen);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'questionnaire':
        return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'appointment':
      case 'appointment_scheduled':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'reminder_sent':
        return <Mail className="w-4 h-4 text-orange-500" />;
      case 'reminder':
        return <Mail className="w-4 h-4 text-orange-500" />; // Legacy support
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/dashboard/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      } else {
        console.error('Error marking all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/dashboard/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Error marking notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark this notification as read if it's unread
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }

    // Call the parent's notification handler
    onNotificationClick(notification);

    // Close notification dropdown
    setIsNotificationOpen(false);
  };

  const dropdownStyles = isMobile
    ? styles.mobileDropdown
    : styles.desktopDropdown;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleNotificationToggle}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium transition-all duration-200 ${
              isMobile ? 'h-5 w-5' : 'h-4 w-4'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isNotificationOpen && (
        <div ref={dropdownRef} className={dropdownStyles}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No recent notifications</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timeAgo}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardNotifications;
