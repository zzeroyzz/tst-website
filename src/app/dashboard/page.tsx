/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Newspaper,
  Users,
  Calendar,
  LogOut,
  Mail,
  Menu,
  X,
  Heart,
  User,
  BookOpen,
  Download,
  House,
  Bell,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./dashboard.module.css";
import {DashboardSkeleton} from "@/components/skeleton";
import KanbanBoard from "@/components/KanbanBoard/KanbanBoard";
import LeadsView from "@/components/Leads/LeadsView";
import NewsletterView from "@/components/Newsletter/NewsletterView";
import DashboardView from "@/components/DashboardView/DashboardView";
import AppointmentsDashboard from "@/components/AppointmentsDashboard/AppointmentsDashboard";
import BlogView from "@/components/Blog/BlogView";

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        router.push("/login");
      }
    };
    getUser();
  }, [supabase, router]);

  // Close mobile menu when clicking outside or on a menu item
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get recent contact submissions (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('archived', false) // Only get non-archived contacts
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(50);

        if (contactsError) {
          console.error('Error fetching contacts:', contactsError);
          return;
        }

        const notificationList = [];

        // Process contacts for various notification types
        contacts?.forEach(contact => {
          const createdAt = new Date(contact.created_at);
          const timeAgo = getTimeAgo(createdAt);

          // Contact form submission
          notificationList.push({
            id: `contact-${contact.id}`,
            type: 'contact',
            title: 'New Contact Submission',
            message: `${contact.name} submitted the contact form`,
            timestamp: createdAt,
            timeAgo,
            data: contact,
            read: false
          });

          // Questionnaire completion
          if (contact.questionnaire_completed && contact.questionnaire_completed_at) {
            notificationList.push({
              id: `questionnaire-${contact.id}`,
              type: 'questionnaire',
              title: 'Questionnaire Completed',
              message: `${contact.name} completed their questionnaire`,
              timestamp: new Date(contact.questionnaire_completed_at),
              timeAgo: getTimeAgo(new Date(contact.questionnaire_completed_at)),
              data: contact,
              read: false
            });
          }

          // Appointment scheduled
          if (contact.scheduled_appointment_at) {
            notificationList.push({
              id: `appointment-${contact.id}`,
              type: 'appointment',
              title: 'Appointment Scheduled',
              message: `${contact.name} scheduled a consultation`,
              timestamp: new Date(contact.scheduled_appointment_at),
              timeAgo: getTimeAgo(new Date(contact.scheduled_appointment_at)),
              data: contact,
              read: false
            });
          }

          // Auto-reminder sent
          if (contact.last_auto_reminder_sent) {
            notificationList.push({
              id: `reminder-${contact.id}-${contact.auto_reminder_count || 1}`,
              type: 'reminder',
              title: 'Auto-Reminder Sent',
              message: `Reminder #${contact.auto_reminder_count || 1} sent to ${contact.name}`,
              timestamp: new Date(contact.last_auto_reminder_sent),
              timeAgo: getTimeAgo(new Date(contact.last_auto_reminder_sent)),
              data: contact,
              read: false
            });
          }
        });

        // Sort by timestamp (newest first)
        notificationList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setNotifications(notificationList);
        setUnreadCount(notificationList.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
      // Refresh notifications every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, supabase]);

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
      case 'reminder': return <Mail className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotificationAsRead = (notificationId: string) => {
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

    // Navigate to relevant section based on notification type
    if (notification.type === 'contact' || notification.type === 'questionnaire') {
      setActiveView('Leads');
    } else if (notification.type === 'appointment') {
      setActiveView('Appointments');
    }

    // Close notification dropdown
    setIsNotificationOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleMenuItemClick = (viewName: string) => {
    setActiveView(viewName);
    setIsMobileMenuOpen(false); // Close mobile menu when item is selected
  };

  const renderView = () => {
    switch (activeView) {
      case "Tasks":
        return <KanbanBoard />;
      case "Newsletter":
        return <NewsletterView />;
      case "Blogs":
        return <BlogView />;
      case "Leads":
        return <LeadsView />;
      case "Appointments":
        return <AppointmentsDashboard />;
      case "Dashboard":
      default:
        return <DashboardView />;
    }
  };

  if (!user) {
    return <DashboardSkeleton />;
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Tasks", icon: CheckSquare },
    { name: "Newsletter", icon: Mail },
    { name: "Blogs", icon: Newspaper },
    { name: "Leads", icon: Users },
    { name: "Appointments", icon: Calendar },
  ];

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'h-full' : ''} flex flex-col`}>
      <div className="flex items-center justify-between mb-10">
        <div className="font-bold text-2xl">Admin Panel</div>
        {!isMobile && (
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Desktop Notification Dropdown */}
            {isNotificationOpen && (
              <div className={styles.desktopDropdown}>
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
        )}
      </div>
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <button
                onClick={() => handleMenuItemClick(item.name)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${
                  activeView === item.name
                    ? "bg-tst-purple text-black"
                    : "hover:bg-gray-100"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </button>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Main Site Navigation */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Main Site
          </h3>
          <ul>
            <li className="mb-2">
              <Link
                href="/"
                className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 text-left"
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
              >
                <House className="mr-3 h-5 w-5 flex-shrink-0" />
                Home
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/therapy-services"
                className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 text-left"
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
              >
                <Heart className="mr-3 h-5 w-5 flex-shrink-0" />
                Therapy Services
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/about"
                className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 text-left"
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5 flex-shrink-0" />
                About
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/mental-health-healing-blog"
                className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 text-left"
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
              >
                <BookOpen className="mr-3 h-5 w-5 flex-shrink-0" />
                Toasted Insights Blog
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/guides"
                className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 text-left"
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
              >
                <Download className="mr-3 h-5 w-5 flex-shrink-0" />
                Free Guides
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <div className={`${isMobile ? 'mt-auto' : ''}`}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100 text-left"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-500">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 border-2 border-black relative">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b-2 border-black p-4 flex items-center justify-between z-50">
        <Image
          src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg"
          alt="TST logo"
          width={75}
          height={10}
        />
        <div className="flex items-center space-x-2">
          {/* Notification Bell */}
          <div className="relative ">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className={styles.mobileDropdown}>
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

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {(isMobileMenuOpen || isNotificationOpen) && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsNotificationOpen(false);
          }}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r p-4 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white border-r p-4 transform transition-transform duration-300 ease-in-out z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isMobile={true} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Add top padding on mobile to account for fixed header */}
        <div className="p-4 md:p-10 pt-20 md:pt-10">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
