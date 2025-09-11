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
  MoreVertical,
  Archive,
  Trash2,
  Eye,
  X,
  Mail,
  Calendar,
  User,
} from 'lucide-react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import toast from 'react-hot-toast';
import { GET_CONTACTS_WITH_MESSAGES } from '@/lib/graphql/queries/contacts';
import { GET_MESSAGES } from '@/lib/graphql/queries/messages';
import { SEND_MESSAGE } from '@/lib/graphql/mutations/messages';
import { getQuickResponseButtonsClient, getConversationStateClient, processUserResponseClient, type QuickResponseButton } from '@/lib/conversations/flow-manager-client';
import { analyzeMessageForResponse, saveConversationResponse } from '@/lib/conversations/response-tracker';
import ScriptBubbles from './ScriptBubbles';
import ConversationHistory from './ConversationHistory';

// MessagingInterface component with real backend integration
const MessagingInterface = () => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickResponseButtons, setQuickResponseButtons] = useState<QuickResponseButton[]>([]);
  const [conversationState, setConversationState] = useState<any>(null);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [modalContact, setModalContact] = useState<any>(null);

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
    pollInterval: 3000, // Poll every 3 seconds for new messages
    notifyOnNetworkStatusChange: false,
  });

  // Mutation for sending messages
  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: async (data) => {
      console.log('✅ Mutation completed, refetching data...', data);
      // Force refetch both messages and contacts immediately
      await Promise.all([
        refetchMessages(),
        refetchContacts()
      ]);
      // Additional refetch after a short delay to catch any delayed updates
      setTimeout(() => {
        refetchMessages();
      }, 1000);
    },
    onError: (error) => {
      console.error('❌ GraphQL Error sending message:', error);
      // Don't show toast here since we handle it in handleSendMessage
    },
  });

  const contacts = (contactsData as any)?.contactsWithMessages?.contacts || [];
  const messages = ((messagesData as any)?.messages?.messages || []).slice().reverse(); // Reverse for chronological order

  // Track message count to detect new inbound messages
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Load conversation state when contact is selected
  useEffect(() => {
    if (selectedContact) {
      loadConversationState(selectedContact.id);
      setLastMessageCount(messages.length); // Reset message count for new contact
    }
  }, [selectedContact]);

  // Detect new inbound messages and save conversation responses
  useEffect(() => {
    if (!selectedContact || messages.length <= lastMessageCount) return;

    // Check if we have a new inbound message
    const newMessages = messages.slice(lastMessageCount);
    const newInboundMessage = newMessages.find(m => m.direction === 'INBOUND');

    if (newInboundMessage) {
      // Find the last outbound message before this inbound message
      const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastOutboundMessage = sortedMessages.find(m =>
        m.direction === 'OUTBOUND' &&
        new Date(m.createdAt) < new Date(newInboundMessage.createdAt)
      );

      if (lastOutboundMessage) {
        const responseData = analyzeMessageForResponse(
          lastOutboundMessage.content,
          newInboundMessage.content
        );

        if (responseData) {
          console.log('🔄 Saving conversation response:', responseData);
          saveConversationResponse(
            selectedContact.id,
            responseData.questionId,
            responseData.question,
            responseData.response,
            responseData.responseValue
          ).then(result => {
            if (result.success) {
              console.log('✅ Conversation response saved successfully');
            } else {
              console.error('❌ Failed to save conversation response:', result.error);
            }
          });
        }
      }
    }

    setLastMessageCount(messages.length);
  }, [messages, lastMessageCount, selectedContact]);

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

  // Handle archive contact
  const handleArchiveContact = async (contactId: string, contactName: string) => {
    try {
      // TODO: Implement archive functionality
      console.log('Archiving contact:', contactId);
      toast.success(`${contactName} archived`);
      setActiveDropdown(null);
      refetchContacts();
    } catch (error) {
      console.error('Error archiving contact:', error);
      toast.error('Failed to archive contact');
    }
  };

  // Handle remove/hide contact
  const handleRemoveContact = async (contactId: string, contactName: string) => {
    try {
      // TODO: Implement remove/hide functionality
      console.log('Removing contact from inbox:', contactId);
      toast.success(`${contactName} removed from inbox`);
      setActiveDropdown(null);
      refetchContacts();
    } catch (error) {
      console.error('Error removing contact:', error);
      toast.error('Failed to remove contact');
    }
  };

  // Handle view contact info
  const handleViewContactInfo = (contact: any) => {
    console.log('Viewing contact info:', contact);
    setModalContact(contact);
    setShowContactModal(true);
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.dropdown-menu')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  return (
    <div className="flex border-2 border-black rounded-lg overflow-hidden">
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

        <div className="overflow-y-auto h-96">
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
                data-contact-id={contact.id}
                className={`p-4 border-b border-gray-200 hover:bg-gray-100 relative ${
                  selectedContact?.id === contact.id ? 'bg-tst-purple' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
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
                    <p className="text-sm text-gray-600 truncate mt-2 max-w-9">
                      {contact.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-400">
                      {contact.lastMessageAt ? formatTimestamp(contact.lastMessageAt) : ''}
                    </span>
                    <div className="relative dropdown-menu">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === contact.id ? null : contact.id);
                        }}
                        className="p-1 rounded bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical size={14} />
                      </Button>

                      {activeDropdown === contact.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black rounded-lg shadow-brutalistLg min-w-[160px] overflow-hidden"
                             style={{ zIndex: 9999 }}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewContactInfo(contact);
                            }}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 cursor-pointer text-sm font-medium transition-colors hover:bg-tst-purple"
                          >
                            <Eye size={16} />
                            View Contact
                          </div>
                          <div className="border-t border-gray-200"></div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveContact(contact.id, contact.name);
                            }}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 cursor-pointer text-sm font-medium transition-colors hover:bg-tst-purple"
                          >
                            <Archive size={16} />
                            Archive
                          </div>
                          <div className="border-t border-gray-200"></div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveContact(contact.id, contact.name);
                            }}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-600 hover:bg-tst-red cursor-pointer text-sm font-medium transition-colors"
                          >
                            <Trash2 size={16} />
                            Remove from Inbox
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
            <div className="max-h-90 flex-1 overflow-y-auto p-4 space-y-4">
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

            {/* Conversation History */}
            {selectedContact && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <ConversationHistory contact={selectedContact} />
              </div>
            )}

            {/* Script Bubbles */}
            {selectedContact?.phoneNumber && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <ScriptBubbles
                  contactId={selectedContact.id}
                  phoneNumber={selectedContact.phoneNumber}
                  messages={messages}
                  contact={selectedContact}
                  onSendMessage={(message) => {
                    setNewMessage(message);
                  }}
                />
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t-2 border-black bg-white">
              <div className="w-full flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1 w-full"
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

      {/* Contact Info Modal - Similar to LeadDetailModal */}
      {showContactModal && modalContact && (
        <div className="fixed inset-0 flex justify-center items-center z-[10000] bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-96 flex flex-col border-2 border-black overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 flex justify-between bg-white border-b border-gray-200 p-4 sm:p-6 relative">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h2 className="text-lg sm:text-xl font-bold truncate">
                      {modalContact.name}
                    </h2>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full self-start flex-shrink-0 ${
                        modalContact.contactStatus === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : modalContact.contactStatus === 'CLIENT'
                            ? 'bg-purple-100 text-purple-700'
                            : modalContact.contactStatus === 'PROSPECT'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {modalContact.contactStatus?.toLowerCase() || 'unknown'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      <span className="break-all">{modalContact.email}</span>
                    </div>
                    {modalContact.phoneNumber && (
                      <div className="flex items-center gap-1">
                        <Phone size={14} />
                        <a
                          href={`tel:${modalContact.phoneNumber}`}
                          className="hover:underline underline-offset-2"
                        >
                          {modalContact.phoneNumber}
                        </a>
                      </div>
                    )}
                  </div>
                  {modalContact.createdAt && (
                    <div className="mt-1">
                      <strong>Contact Created: </strong>
                      <span className="text-gray-600">
                        {new Date(modalContact.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Close button */}
              <Button
                onClick={() => {
                  setShowContactModal(false);
                  setModalContact(null);
                }}
                className="bg-tst-red text-white"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column - Message Info */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-sm mb-2 text-blue-800 flex items-center gap-2">
                        <MessageCircle size={16} />
                        Message History
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total Messages:</span>
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                            {modalContact.messageCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Messages Sent:</span>
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                            {modalContact.messagesSent || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Messages Received:</span>
                          <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 font-medium">
                            {modalContact.messagesReceived || 0}
                          </span>
                        </div>
                        {modalContact.lastMessageAt && (
                          <div>
                            <span className="font-medium">Last Message:</span>
                            <p className="text-gray-600 mt-1">{formatTimestamp(modalContact.lastMessageAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {modalContact.segments && modalContact.segments.length > 0 && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <h3 className="font-bold text-sm mb-2 text-purple-800">
                          Contact Segments
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {modalContact.segments.map((segment: string) => (
                            <span
                              key={segment}
                              className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
                            >
                              {segment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Additional Info */}
                  <div className="space-y-4">
                    {modalContact.scheduledAppointmentAt && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <h3 className="font-bold text-sm mb-2 text-green-800 flex items-center gap-2">
                          <Calendar size={16} />
                          Appointment Information
                        </h3>
                        <div className="space-y-1 text-xs">
                          <p>
                            <strong>Scheduled:</strong>
                            <br />
                            {new Date(modalContact.scheduledAppointmentAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {modalContact.appointmentStatus && (
                            <p className="flex items-center gap-2">
                              <strong>Status:</strong>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  modalContact.appointmentStatus === 'SCHEDULED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : modalContact.appointmentStatus === 'COMPLETED'
                                      ? 'bg-green-100 text-green-800'
                                      : modalContact.appointmentStatus === 'CANCELLED'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {modalContact.appointmentStatus}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <User size={16} />
                        Contact Details
                      </h3>
                      <div className="space-y-2 text-xs">
                        {modalContact.crmNotes && (
                          <div>
                            <strong>Notes:</strong>
                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                              {modalContact.crmNotes}
                            </p>
                          </div>
                        )}
                        {modalContact.customFields && Object.keys(modalContact.customFields).length > 0 && (
                          <div>
                            <strong>Custom Fields:</strong>
                            <div className="mt-1 space-y-1">
                              {Object.entries(modalContact.customFields).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium">{key}:</span>
                                  <span className="text-gray-600">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 sm:p-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setShowContactModal(false);
                    setModalContact(null);
                  }}
                  className="bg-gray-200 text-black border-2 border-black"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingInterface;
