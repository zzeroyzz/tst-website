'use client';

import React from 'react';
import {
  TrendingUp,
  Users,
  MessageCircle,
  Calendar,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const CRMAnalytics = () => {
  // Mock analytics data
  const stats = [
    {
      title: 'Total Contacts',
      value: '247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Messages Sent',
      value: '1,429',
      change: '+23%',
      changeType: 'positive' as const,
      icon: MessageCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Consultations Scheduled',
      value: '89',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Response Rate',
      value: '73%',
      change: '-2%',
      changeType: 'negative' as const,
      icon: Phone,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const messageStats = [
    { label: 'Delivered', value: 1342, percentage: 94, color: 'bg-green-500' },
    { label: 'Pending', value: 52, percentage: 4, color: 'bg-yellow-500' },
    { label: 'Failed', value: 35, percentage: 2, color: 'bg-red-500' },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'message_sent',
      title: 'Welcome message sent',
      description: 'To Sarah Johnson',
      timestamp: '2 minutes ago',
      icon: MessageCircle,
      iconColor: 'text-green-600',
    },
    {
      id: '2',
      type: 'appointment_scheduled',
      title: 'Consultation scheduled',
      description: 'Michael Chen - Tomorrow 2:00 PM',
      timestamp: '15 minutes ago',
      icon: Calendar,
      iconColor: 'text-blue-600',
    },
    {
      id: '3',
      type: 'contact_created',
      title: 'New contact added',
      description: 'Emma Wilson via contact form',
      timestamp: '1 hour ago',
      icon: Users,
      iconColor: 'text-purple-600',
    },
    {
      id: '4',
      type: 'reminder_sent',
      title: 'Appointment reminder sent',
      description: 'To David Park',
      timestamp: '2 hours ago',
      icon: Clock,
      iconColor: 'text-yellow-600',
    },
  ];

  const topTemplates = [
    { name: 'Welcome - New Consultation', uses: 45, successRate: '92%' },
    { name: 'Appointment Reminder - 24h', uses: 38, successRate: '89%' },
    { name: 'Questionnaire Follow-up', uses: 24, successRate: '76%' },
    { name: 'Post-consultation Thank You', uses: 18, successRate: '95%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CRM Analytics</h2>
        <p className="text-gray-600">
          Track your messaging and contact management performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border-2 border-black rounded-lg shadow-brutalist p-6"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div
                  className={`flex items-center text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  <TrendingUp
                    className={`h-4 w-4 mr-1 ${
                      stat.changeType === 'negative' ? 'rotate-180' : ''
                    }`}
                  />
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Delivery Status */}
        <div className="bg-white border-2 border-black rounded-lg shadow-brutalist p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Message Delivery
          </h3>
          <div className="space-y-4">
            {messageStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stat.color}`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Templates */}
        <div className="bg-white border-2 border-black rounded-lg shadow-brutalist p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Top Performing Templates
          </h3>
          <div className="space-y-3">
            {topTemplates.map((template, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-500">{template.uses} uses</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-green-600">
                    {template.successRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border-2 border-black rounded-lg shadow-brutalist p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivity.map(activity => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div
                  className={`p-2 rounded-full bg-gray-100 ${activity.iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Overview Chart Placeholder */}
      <div className="bg-white border-2 border-black rounded-lg shadow-brutalist p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Weekly Message Volume
        </h3>
        <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Chart visualization would go here
            </p>
            <p className="text-sm text-gray-500">
              Integration with chart library needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMAnalytics;
