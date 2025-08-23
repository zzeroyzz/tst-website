'use client';

import React, { useState } from 'react';
import {
  Search,
  Send,
  Phone,
  Clock,
  Check,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';

// Placeholder component for messaging interface
const MessagingInterface = () => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data for demonstration
  const contacts = [
    {
      id: '1',
      name: 'Sarah Johnson',
      phone: '+1234567890',
      lastMessage: 'Thank you for the consultation info!',
      lastMessageTime: '2h ago',
      unreadCount: 2,
      status: 'active',
    },
    {
      id: '2',
      name: 'Michael Chen',
      phone: '+1987654321',
      lastMessage: 'When is my next appointment?',
      lastMessageTime: '5h ago',
      unreadCount: 0,
      status: 'scheduled',
    },
  ];

  const messages = selectedContact
    ? [
        {
          id: '1',
          content: "Hi! I'm interested in scheduling a consultation.",
          direction: 'inbound',
          timestamp: new Date(Date.now() - 3600000),
          status: 'received',
        },
        {
          id: '2',
          content:
            'Hi Sarah! Thanks for reaching out. I have availability this week for a consultation. Would Tuesday at 2pm work for you?',
          direction: 'outbound',
          timestamp: new Date(Date.now() - 3000000),
          status: 'delivered',
        },
        {
          id: '3',
          content: 'That works perfectly! How do I prepare for the session?',
          direction: 'inbound',
          timestamp: new Date(Date.now() - 1800000),
          status: 'received',
        },
      ]
    : [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    // TODO: Implement actual message sending via GraphQL
    console.log('Sending message:', newMessage, 'to:', selectedContact.name);
    setNewMessage('');
  };

  return (
    <div className="h-[600px] flex border-2 border-black rounded-lg overflow-hidden">
      {/* Contact List */}
      <div className="w-1/3 border-r-2 border-black bg-gray-50">
        <div className="p-4 border-b-2 border-black bg-white">
          <h3 className="font-bold text-lg mb-3">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search contacts..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                selectedContact?.id === contact.id ? 'bg-tst-purple' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{contact.name}</h4>
                    {contact.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </p>
                  <p className="text-sm text-gray-600 truncate mt-2">
                    {contact.lastMessage}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {contact.lastMessageTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b-2 border-black bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedContact.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedContact.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {selectedContact.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.direction === 'outbound'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-tst-purple text-black'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.direction === 'outbound' && (
                        <div className="flex items-center gap-1">
                          {message.status === 'delivered' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : message.status === 'sent' ? (
                            <Clock className="h-3 w-3 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t-2 border-black bg-white">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-tst-purple  disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                Select a contact to start messaging
              </p>
              <p className="text-sm">
                Choose a contact from the list to view conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingInterface;
