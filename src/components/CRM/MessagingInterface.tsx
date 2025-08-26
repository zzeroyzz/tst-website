'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Search,
  Send,
  Phone,
  Clock,
  Check,
  AlertCircle,
  MessageCircle,
  Loader,
  Zap,
} from 'lucide-react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import toast from 'react-hot-toast';
import { GET_CONTACTS_WITH_MESSAGES } from '@/lib/graphql/queries/contacts';
import { GET_MESSAGES } from '@/lib/graphql/queries/messages';
import { SEND_MESSAGE } from '@/lib/graphql/mutations/messages';
import { getQuickResponseButtonsClient, getConversationStateClient, processUserResponseClient, type QuickResponseButton } from '@/lib/conversations/flow-manager-client';

// MessagingInterface component with real backend integration
const MessagingInterface = () => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickResponseButtons, setQuickResponseButtons] = useState<QuickResponseButton[]>([]);
  const [conversationState, setConversationState] = useState<any>(null);
  const [showQuickResponses, setShowQuickResponses] = useState(false);

  // Query for contacts with recent messages
  const {
    data: contactsData,
    loading: contactsLoading,
    error: contactsError,
    refetch: refetchContacts
  } = useQuery(GET_CONTACTS_WITH_MESSAGES, {
    variables: { limit: 50 },
    pollInterval: 30000, // Poll every 30 seconds for new messages
    notifyOnNetworkStatusChange: false, // Prevent UI updates during background refetches
    fetchPolicy: 'network-only', // Always fetch fresh data for accurate contact ordering
  });

  // Query for messages of selected contact
  const {
    data: messagesData,
    loading: messagesLoading,
    refetch: refetchMessages
  } = useQuery(GET_MESSAGES, {
    variables: {
      contactId: selectedContact?.id,
      limit: 100
    },
    skip: !selectedContact,
    fetchPolicy: 'cache-and-network', // Always fetch fresh data
  });

  // Mutation for sending messages
  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      console.log('✅ Mutation completed, refetching data...', data);
      refetchMessages();
      refetchContacts(); // This should update the contact order
    },
    onError: (error) => {
      console.error('❌ GraphQL Error sending message:', error);
      // Don't show toast here since we handle it in handleSendMessage
    },
  });

  const contacts = (contactsData as any)?.contactsWithMessages?.contacts || [];
  const messages = ((messagesData as any)?.messages?.messages || []).slice().reverse(); // Reverse for chronological order

  // Load conversation state when contact is selected
  useEffect(() => {
    if (selectedContact) {
      loadConversationState(selectedContact.id);
    }
  }, [selectedContact]);

  const loadConversationState = async (contactId: string) => {
    try {
      // Disable conversation state for now to avoid database errors
      console.log('Conversation state disabled for contactId:', contactId);
      setConversationState(null);
      setQuickResponseButtons([]);

      // TODO: Re-enable when conversation API routes are implemented
      // const state = await getConversationStateClient(contactId);
      // setConversationState(state);
      // if (state) {
      //   const buttons = getQuickResponseButtonsClient(state.currentStepId, state.variables);
      //   setQuickResponseButtons(buttons);
      // } else {
      //   setQuickResponseButtons([]);
      // }
    } catch (error) {
      console.error('Error loading conversation state:', error);
      setConversationState(null);
      setQuickResponseButtons([]);
    }
  };

  // Filter contacts based on search term (first letter match or full search)
  const filteredContacts = contacts.filter((contact: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase().trim();

    // If search is a single character, match first letter of name
    if (search.length === 1) {
      return contact.name.toLowerCase().charAt(0) === search;
    }

    // For longer searches, use contains matching
    return contact.name.toLowerCase().includes(search) ||
           contact.phoneNumber?.toLowerCase().includes(search);
  });

  const sortedContacts = [...filteredContacts].sort((a: any, b: any) => {
  const aTime = a?.lastMessageAt ? new Date(a.lastMessageAt).getTime() : -Infinity;
  const bTime = b?.lastMessageAt ? new Date(b.lastMessageAt).getTime() : -Infinity;
  return bTime - aTime;
});

  const handleSendMessage = async (messageContent?: string, nextStepId?: string) => {
    console.log('🚀 handleSendMessage called', { messageContent, nextStepId, selectedContact: selectedContact?.name, newMessage });

    const content = messageContent || newMessage.trim();
    if (!content || !selectedContact || sendingMessage) {
      console.log('❌ Validation failed:', { content, selectedContact: !!selectedContact, sendingMessage });
      return;
    }

    try {
      // Ensure all variables are serializable (no DOM elements or circular refs)
      const cleanInput = {
        contactId: String(selectedContact.id), // Ensure it's a string
        content: String(content), // Ensure it's a string
        messageType: 'SMS' as const,
      };

      console.log('📤 Sending message with clean input:', cleanInput);

      // Send the message via SMS
      const result = await sendMessage({
        variables: {
          input: cleanInput,
        },
      });

      console.log('✅ Message sent successfully:', result);

      // Update conversation state if this is a structured response
      // Disabled for now to avoid API errors
      if (false && messageContent && conversationState) {
        try {
          const updatedState = await processUserResponseClient(
            selectedContact.id,
            messageContent || '',
            nextStepId
          );
          setConversationState(updatedState);

          // Update quick response buttons for new step
          const buttons = getQuickResponseButtonsClient(updatedState.currentStepId, updatedState.variables);
          setQuickResponseButtons(buttons);
        } catch (error) {
          console.error('Error updating conversation state:', error);
          toast.error('Failed to update conversation state');
        }
      }

      // Clear the manual message input if used
      if (!messageContent) {
        setNewMessage('');
      }

      console.log('🎉 About to show success toast');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Extract just the error message to avoid circular references
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to send message: ${errorMessage}`);
    }
  };

  const handleQuickResponse = async (button: QuickResponseButton) => {
    try {
      // Ensure button data is clean (no circular references)
      const cleanMessageContent = typeof button.messageContent === 'string' ? button.messageContent : '';
      const cleanNextStepId = typeof button.nextStepId === 'string' ? button.nextStepId : undefined;

      await handleSendMessage(cleanMessageContent, cleanNextStepId);
    } catch (error) {
      console.error('Error in handleQuickResponse:', error);
      toast.error('Failed to send quick response');
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get status icon for message
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <Check className="h-3 w-3 text-green-600" />;
      case 'sent':
      case 'queued':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'failed':
      case 'undelivered':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-h-90 flex border-2 border-black rounded-lg overflow-hidden">
      {/* Contact List */}
      <div className="w-1/3 border-r-2 border-black bg-gray-50">
        <div className="p-4 border-b-2 border-black bg-white">
          <h3 className="font-bold text-lg mb-3">Messages</h3>
         <div className="relative">
  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
    <Search className="h-4 w-4 text-gray-400" />
  </span>
  <Input
    type="text"
    placeholder="Search contacts..."
    className="w-full h-10 pl-10"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
        </div>

        <div className="overflow-y-auto h-96 overflow-scroll">
          {contactsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading contacts...</span>
            </div>
          ) : contactsError ? (
            <div className="p-4 text-red-600 text-sm">
              Error loading contacts: {contactsError.message}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">
              {searchTerm ? 'No contacts found matching your search' : 'No contacts with messages'}
            </div>
          ) : (
            filteredContacts.map((contact: any) => (
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
                      {contact.unreadMessageCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {contact.unreadMessageCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {contact.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-600 truncate mt-2">
                      {contact.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {contact.lastMessageAt ? formatTimestamp(contact.lastMessageAt) : ''}
                  </span>
                </div>
              </div>
            ))
          )}
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
                    {selectedContact.phoneNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedContact.contactStatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {selectedContact.contactStatus?.toLowerCase() || 'unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.direction === 'OUTBOUND'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'OUTBOUND'
                          ? 'bg-tst-purple text-black'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                        {message.direction === 'OUTBOUND' && (
                          <div className="flex items-center gap-1">
                            {getStatusIcon(message.messageStatus)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t-2 border-black bg-white">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1"
                  disabled={sendingMessage}
                />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-tst-purple disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {selectedContact?.phoneNumber ? (
                <p className="text-xs text-gray-500 mt-2">
                  Messages will be sent via SMS to {selectedContact.phoneNumber}
                </p>
              ) : (
                <p className="text-xs text-red-500 mt-2">
                  No phone number available for this contact
                </p>
              )}

              {/* Quick Response Toggle */}
              {quickResponseButtons.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <button
                    onClick={() => setShowQuickResponses(!showQuickResponses)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2"
                  >
                    <Zap className="h-4 w-4" />
                    Quick Responses ({quickResponseButtons.length})
                    <span className="text-xs">
                      {showQuickResponses ? '▼' : '▶'}
                    </span>
                  </button>

                  {showQuickResponses && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        {conversationState?.currentStepId && `Step ${conversationState.currentStepId}`}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {quickResponseButtons.map((button) => (
                          <button
                            key={button.id}
                            onClick={(e) => {
                              e.preventDefault();
                              handleQuickResponse(button);
                            }}
                            disabled={sendingMessage}
                            className={`px-3 py-2 rounded-md text-sm text-left transition-colors disabled:opacity-50 ${
                              button.category === 'primary'
                                ? 'bg-tst-purple hover:bg-purple-200 text-black border-2 border-black'
                                : button.category === 'warning'
                                ? 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{button.label}</div>
                            <div className="text-xs opacity-75 mt-1">
                              "{button.messageContent}"
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
