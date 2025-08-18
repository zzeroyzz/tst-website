/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/DashboardNotifications/DashboardNotifications.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Users,
  CheckSquare,
  Calendar,
  Mail,
  Bell,
} from "lucide-react";
import { Notification } from "@/types/notification";
import styles from "./DashboardNotifications.module.css";

interface DashboardNotificationsProps {
  user: any;
  onNotificationClick: (notification: any) => void;
  // Shared state props
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  localReadNotifications: Set<string>;
  setLocalReadNotifications: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const DashboardNotifications: React.FC<DashboardNotificationsProps> = ({
  user,
  onNotificationClick,
  // Destructure shared state
  notifications,
  setNotifications,
  unreadCount,
  setUnreadCount,
  localReadNotifications,
  setLocalReadNotifications
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  // Helper function to get time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contact': return <Users className="w-4 h-4 text-blue-500" />;
      case 'questionnaire': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'appointment': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'reminder_sent': return <Mail className="w-4 h-4 text-orange-500" />;
      case 'reminder': return <Mail className="w-4 h-4 text-orange-500" />; // Legacy support
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const markAllAsRead = async () => {
    // Mark all notifications as read locally
    const allNotificationIds = notifications.map(n => n.id);
    const updatedReadNotifications = new Set([...localReadNotifications, ...allNotificationIds]);
    setLocalReadNotifications(updatedReadNotifications);

    // Also mark in database for actual notifications table entries
    try {
      const databaseNotificationIds = notifications
        .filter(n => typeof n.id === 'string' && !n.id.includes('-'))
        .map(n => n.id);

      if (databaseNotificationIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', databaseNotificationIds);
      }
    } catch (error) {
      console.error('Error marking notifications as read in database:', error);
    }

    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotificationAsRead = async (notificationId: string) => {
    // Mark notification as read locally
    const updatedReadNotifications = new Set([...localReadNotifications, notificationId]);
    setLocalReadNotifications(updatedReadNotifications);

    // Also mark in database if it's a database notification
    try {
      if (typeof notificationId === 'string' && !notificationId.includes('-')) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read in database:', error);
    }

    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification: any) => {
    // Mark this notification as read
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
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium ${
            isMobile ? 'h-5 w-5' : 'h-4 w-4'
          }`}>
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

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No recent notifications</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
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
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
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
