'use client';

import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Settings, BarChart3, Plus } from 'lucide-react';
import ContactsManager from './ContactsManager';
import MessagingInterface from './MessagingInterface';
import MessageTemplates from './MessageTemplates';
import CRMAnalytics from './CRMAnalytics';
import Button from '@/components/Button/Button';

type CRMTab = 'contacts' | 'messaging' | 'templates' | 'analytics';

const CRMView = () => {
  const [activeTab, setActiveTab] = useState<CRMTab>('contacts');

  // Load saved active tab from localStorage on component mount
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('crmActiveTab');
      if (savedTab && ['contacts', 'messaging', 'templates', 'analytics'].includes(savedTab)) {
        setActiveTab(savedTab as CRMTab);
      }
    } catch (error) {
      console.error('Error loading saved CRM tab from localStorage:', error);
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('crmActiveTab', activeTab);
    } catch (error) {
      console.error('Error saving CRM tab to localStorage:', error);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'contacts' as CRMTab, name: 'Contacts', icon: Users },
    { id: 'messaging' as CRMTab, name: 'Messaging', icon: MessageCircle },
    { id: 'templates' as CRMTab, name: 'Templates', icon: Settings },
    { id: 'analytics' as CRMTab, name: 'Analytics', icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contacts':
        return <ContactsManager />;
      case 'messaging':
        return <MessagingInterface />;
      case 'templates':
        return <MessageTemplates />;
      case 'analytics':
        return <CRMAnalytics />;
      default:
        return <ContactsManager />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CRM & Messaging
          </h1>
          <p className="text-gray-600">
            Manage contacts, send messages, and track communications
          </p>
        </div>
        <Button
          className="bg-tst-purple text-white border-2 border-black"
          onClick={() => setActiveTab('contacts')}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Contact
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-tst-purple text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id
                      ? 'text-purple-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border-2 border-black rounded-lg shadow-brutalistLg p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CRMView;
