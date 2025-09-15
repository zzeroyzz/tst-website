'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import Button from '@/components/Button/Button';
import { fitFreeTemplate } from '@/data/fitFreeTemplateData';
import { getAvailableSlotsClient, type AvailableSlot } from '@/lib/appointments/availability';

interface ScriptBubblesProps {
  contactId: string;
  phoneNumber: string;
  messages: any[]; // Last few messages to determine conversation state
  contact: any; // Full contact object with UUID
  onSendMessage: (message: string) => void;
}

const ScriptBubbles: React.FC<ScriptBubblesProps> = ({
  contactId,
  phoneNumber,
  messages = [],
  contact,
  onSendMessage,
}) => {
  const [currentTemplates, setCurrentTemplates] = useState<typeof fitFreeTemplate>([]);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [availableSlots, setAvailableSlots] = useState<{today: AvailableSlot | null, tomorrow: AvailableSlot | null}>({
    today: null,
    tomorrow: null
  });
  const [isDevMode, setIsDevMode] = useState(false);

  // Log contact data for debugging
  useEffect(() => {
    console.log('📊 ScriptBubbles - Contact state:', {
      contactId,
      contact,
      hasScheduledAppointment: !!contact?.scheduledAppointmentAt,
      appointmentStatus: contact?.appointmentStatus,
      scheduledAppointmentAt: contact?.scheduledAppointmentAt
    });
  }, [contactId, contact]);

  // Determine which templates to show based on conversation state
  useEffect(() => {
    // Get the most recent messages (reverse chronological order)
    const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastInboundMessage = sortedMessages.find(m => m.direction === 'INBOUND')?.content?.toLowerCase() || '';
    const lastOutboundMessage = sortedMessages.find(m => m.direction === 'OUTBOUND')?.content || '';

    // Check if we have new messages
    const hasNewMessages = messages.length > lastMessageCount;
    if (hasNewMessages) {
      setLastMessageCount(messages.length);
      console.log('🔄 ScriptBubbles - New messages detected, updating templates');
    }

    console.log('ScriptBubbles - Messages updated:', {
      totalMessages: messages.length,
      hasNew: hasNewMessages,
      lastInbound: lastInboundMessage,
      lastOutbound: lastOutboundMessage.substring(0, 50) + '...'
    });

    // Determine conversation flow based on last messages
    let templatesToShow: typeof fitFreeTemplate = [];

    // Check if we're waiting for a response - if the last message is OUTBOUND and no INBOUND response after it
    const lastOutboundTime = sortedMessages.find(m => m.direction === 'OUTBOUND')?.createdAt;
    const lastInboundTime = sortedMessages.find(m => m.direction === 'INBOUND')?.createdAt;
    const isWaitingForResponse = lastOutboundTime && (!lastInboundTime || new Date(lastOutboundTime) > new Date(lastInboundTime));

    console.log('Conversation state:', {
      isWaitingForResponse,
      lastOutboundTime,
      lastInboundTime,
      lastOutbound: lastOutboundMessage.substring(0, 30),
      lastInbound: lastInboundMessage,
      pullForwardCheck: {
        hasGetSooner: lastOutboundMessage.includes("get you in sooner"),
        waiting: isWaitingForResponse,
        wouldMatch: lastOutboundMessage.includes("get you in sooner") && !isWaitingForResponse
      }
    });

    // If no messages yet, show confirmation (the true beginning)
    if (messages.length === 0) {
      templatesToShow = [fitFreeTemplate.find(t => t.id === '1')!]; // Confirmation
    }
    // If we just sent the confirmation and waiting for response, wait for customer to respond
    else if (lastOutboundMessage.includes("Quick 3 Qs to prep") && isWaitingForResponse) {
      console.log('🔄 After confirmation, waiting for customer response');
      templatesToShow = []; // Wait for their response before showing next template
    }
    // If customer responded to confirmation, show Georgia question
    else if (lastOutboundMessage.includes("Quick 3 Qs to prep") && !isWaitingForResponse && lastInboundMessage) {
      console.log('✅ Customer responded to confirmation, showing Georgia question');
      templatesToShow = [fitFreeTemplate.find(t => t.id === '2')!]; // State question
    }
    // If we already sent the confirmation recently, don't show it again
    else if (lastOutboundMessage.includes("Quick 3 Qs to prep") && !isWaitingForResponse && !lastInboundMessage) {
      console.log('⚠️ Confirmation already sent recently, waiting for response');
      templatesToShow = []; // Don't show templates, wait for response
    }
    // If we asked "Are you in Georgia?" and they haven't responded yet, wait
    else if (lastOutboundMessage.includes("Are you in Georgia?") && isWaitingForResponse) {
      templatesToShow = []; // Wait for their response
    }
    // If they responded to "Are you in Georgia?"
    else if (lastOutboundMessage.includes("Are you in Georgia?") && !isWaitingForResponse) {
      if (lastInboundMessage.includes('1') || lastInboundMessage.includes('yes')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '3')!]; // Fit-or-Free offer
      } else if (lastInboundMessage.includes('2') || lastInboundMessage.includes('no')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '2b')!]; // Not in state - referrals
      }
    }
    // If we asked "Fit or Free" and they haven't responded yet, wait
    else if (lastOutboundMessage.includes("Fit or Free first session") && isWaitingForResponse) {
      templatesToShow = []; // Wait for their response
    }
    // If they responded to Fit-or-Free offer
    else if (lastOutboundMessage.includes("Fit or Free first session") && !isWaitingForResponse) {
      if (lastInboundMessage.includes('1') || lastInboundMessage.includes('yes')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '4')!]; // Private pay rate
      } else if (lastInboundMessage.includes('2') || lastInboundMessage.includes('no')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '3b')!]; // Not interested - referrals
      }
    }
    // If we asked about "$150 private pay" and they haven't responded yet, wait
    else if (lastOutboundMessage.includes("$150 private pay") && isWaitingForResponse) {
      templatesToShow = []; // Wait for their response
    }
    // If they responded to private pay rate
    else if (lastOutboundMessage.includes("$150 private pay") && !isWaitingForResponse) {
      if (lastInboundMessage.includes('1') || lastInboundMessage.includes('yes')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '5')!]; // Main focus menu
      } else if (lastInboundMessage.includes('2') || lastInboundMessage.includes('superbill')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '4b')!]; // What is superbill
      } else if (lastInboundMessage.includes('3') || lastInboundMessage.includes('insurance')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '4c')!]; // Insurance referrals
      }
    }
    // If we explained superbill and they haven't responded yet, wait
    else if (lastOutboundMessage.includes("superbill is a receipt") && isWaitingForResponse) {
      templatesToShow = []; // Wait for their response
    }
    // If they responded to superbill explanation
    else if (lastOutboundMessage.includes("superbill is a receipt") && !isWaitingForResponse) {
      if (lastInboundMessage.includes('1') || lastInboundMessage.includes('yes')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '5')!]; // Main focus menu
      } else if (lastInboundMessage.includes('2') || lastInboundMessage.includes('insurance')) {
        templatesToShow = [fitFreeTemplate.find(t => t.id === '4c')!]; // Insurance referrals
      }
    }
    // If we asked "Main focus?" and they haven't responded yet, wait
    else if (lastOutboundMessage.includes("Main focus?") && isWaitingForResponse) {
      templatesToShow = []; // Wait for their response
    }
    // If they responded to main focus menu
    else if (lastOutboundMessage.includes("Main focus?") && !isWaitingForResponse) {
      // Map response numbers to focus labels (handle multiple selections)
      const focusMap: Record<string, string> = {
        '1': 'anxiety',
        '2': 'trauma',
        '3': 'burnout',
        '4': 'self-esteem',
        '5': 'relationships',
        '6': 'transitions',
        '7': 'identity',
        '8': 'ND support',
        '9': 'stress',
        '0': 'other concerns'
      };

      const selectedFocus: string[] = [];
      for (const digit of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
        if (lastInboundMessage.includes(digit)) {
          selectedFocus.push(focusMap[digit]);
        }
      }

      const focusLabel = selectedFocus.length > 0 ? selectedFocus.join(', ') : 'your main concerns';

      // Update the focus acknowledgement template with the correct label
      const focusAckTemplate = {
        ...fitFreeTemplate.find(t => t.id === '6')!,
        content: fitFreeTemplate.find(t => t.id === '6')!.content.replace('{{focus_label}}', focusLabel)
      };

      templatesToShow = [
        focusAckTemplate, // Focus acknowledgement with replaced variable
        fitFreeTemplate.find(t => t.id === '7')!  // Pull-forward offer
      ];
    }
    // If we offered pull-forward and they haven't responded yet, wait
    else if (lastOutboundMessage.includes("get you in sooner") && isWaitingForResponse) {
      templatesToShow = []; // Wait for their response
    }
    // If they responded to pull-forward offer
    else if (lastOutboundMessage.includes("get you in sooner") && !isWaitingForResponse) {
      console.log('🎯 Pull-forward response detected:', lastInboundMessage);

      // Show immediate response templates based on the response
      if (lastInboundMessage.includes('1') || lastInboundMessage.includes('2')) {
        // Show "moving" confirmation immediately
        const moveTemplate = {
          ...fitFreeTemplate.find(t => t.id === '7b')!,
          content: lastInboundMessage.includes('1')
            ? `You're moved to ${availableSlots.today?.displayTime || 'earlier today'}. Calendar updated.`
            : `You're moved to ${availableSlots.tomorrow?.displayTime || 'tomorrow'}. Calendar updated.`
        };
        templatesToShow = [moveTemplate];

        // Handle the actual appointment rescheduling in the background
        handlePullForwardResponse(lastInboundMessage);

      } else if (lastInboundMessage.includes('3')) {
        // Show "keep time" confirmation
        const currentTime = contact?.scheduledAppointmentAt ?
          new Date(contact.scheduledAppointmentAt).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
          }) : 'your scheduled time';

        const keepTemplate = {
          ...fitFreeTemplate.find(t => t.id === '7c')!,
          content: `Locked for ${currentTime}. Any reason you think you might miss it?`
        };
        templatesToShow = [keepTemplate];
      }
    }
    // Auto-reply handlers
    else if (lastInboundMessage.includes('reschedule') || lastInboundMessage === '2') {
      templatesToShow = [fitFreeTemplate.find(t => t.id === '20')!]; // Auto-reply reschedule
    }
    else if (lastInboundMessage.includes('cancel') || lastInboundMessage === '3') {
      // Handle the appointment cancellation immediately
      handleCancellationRequest();
      // Don't show any templates yet - they'll be set by handleCancellationRequest
      templatesToShow = [];
    }
    else if (lastInboundMessage.includes('help')) {
      templatesToShow = [fitFreeTemplate.find(t => t.id === '22')!]; // Auto-reply help
    }
    // Default fallback - show common templates
    else {
      console.log('🤔 No specific flow matched, using fallback');

      // Only show fallback templates if we haven't sent recent messages
      const recentMessage = messages.length > 0 && messages.some(m => {
        const messageTime = new Date(m.createdAt);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return messageTime > fiveMinutesAgo && m.direction === 'OUTBOUND';
      });

      if (recentMessage) {
        console.log('🚫 Recent message sent, not showing fallback templates');
        templatesToShow = [];
      } else {
        templatesToShow = [
          fitFreeTemplate.find(t => t.id === '2')!, // State question
          fitFreeTemplate.find(t => t.id === '8')!, // Ghosting same day
          fitFreeTemplate.find(t => t.id === '9')!, // T-60 reminder
        ].filter(Boolean);
      }
    }

    setCurrentTemplates(templatesToShow.filter(Boolean));

    // Load available appointment slots if we're about to show pull-forward offer
    if (templatesToShow.some(t => t.id === '7')) {
      loadAvailableSlots();
    }
  }, [messages]);

  // Load available appointment slots
  const loadAvailableSlots = async () => {
    try {
      const slots = await getAvailableSlotsClient();
      setAvailableSlots(slots);
      console.log('📅 Available slots loaded:', slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots({ today: null, tomorrow: null });
    }
  };

  const handleRestartFlow = () => {
    console.log('🔄 Restarting conversation flow from the beginning (confirmation)');

    // Force show the confirmation template (ID: 1) - the true beginning
    const confirmationTemplate = fitFreeTemplate.find(t => t.id === '1');
    if (confirmationTemplate) {
      setCurrentTemplates([confirmationTemplate]);
    }

    // Reset message tracking
    setLastMessageCount(0);

    // Clear available slots
    setAvailableSlots({ today: null, tomorrow: null });
  };

  // Handle pull-forward appointment rescheduling using existing API routes
  const handlePullForwardResponse = async (response: string) => {
    console.log('🚀 handlePullForwardResponse called with:', response);

    if (!contact?.uuid) {
      console.error('No contact UUID found for rescheduling');
      return;
    }

    try {
      let newDateTime: string;
      let displayTime: string;

      if (response.includes('1') && availableSlots.today) {
        // Move to today
        console.log('📅 Rescheduling to today:', availableSlots.today);
        newDateTime = availableSlots.today.startTime;
        displayTime = availableSlots.today.displayTime;
      } else if (response.includes('2') && availableSlots.tomorrow) {
        // Move to tomorrow
        console.log('📅 Rescheduling to tomorrow:', availableSlots.tomorrow);
        newDateTime = availableSlots.tomorrow.startTime;
        displayTime = availableSlots.tomorrow.displayTime;
      } else {
        console.error('Invalid response or no available slot for:', response);
        return;
      }

      // Use existing API route for rescheduling
      const rescheduleResponse = await fetch('/api/appointment/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: contact.uuid,
          newDateTime: newDateTime
        }),
      });

      const result = await rescheduleResponse.json();

      if (!rescheduleResponse.ok) {
        throw new Error(result.message || 'Failed to reschedule appointment');
      }

      console.log('✅ Appointment rescheduled successfully via API:', result);

      // Update the template with actual time - use simple confirmation message as requested
      const updatedTemplate = {
        ...fitFreeTemplate.find(t => t.id === '7b')!,
        content: `You're moved to ${displayTime}. Calendar updated.`
      };
      setCurrentTemplates([updatedTemplate]);

    } catch (error) {
      console.error('Error handling pull-forward response:', error);
      // Show error template or fallback
      const errorTemplate = {
        id: 'error-reschedule',
        name: 'Reschedule Error',
        content: 'Sorry, there was an issue rescheduling your appointment. Please reply with "RESCHEDULE" to try again or call us directly.',
        category: 'error',
        variables: []
      };
      setCurrentTemplates([errorTemplate]);
    }
  };

  // Handle appointment cancellation using existing API routes
  const handleCancellationRequest = async () => {
    if (!contact?.uuid) {
      console.error('No contact UUID found for cancellation');
      return;
    }

    try {
      console.log('❌ Cancelling appointment via API for UUID:', contact.uuid);

      // Use existing API route for cancellation
      const cancelResponse = await fetch('/api/appointment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: contact.uuid
        }),
      });

      const result = await cancelResponse.json();

      if (!cancelResponse.ok) {
        throw new Error(result.message || 'Failed to cancel appointment');
      }

      console.log('✅ Appointment cancelled successfully via API:', result);

      // Show the cancel confirmation template
      const updatedTemplate = {
        ...fitFreeTemplate.find(t => t.id === '21')!,
        content: fitFreeTemplate.find(t => t.id === '21')!.content.replace(
          '{{contact_uuid}}',
          contact.uuid || ''
        )
      };
      setCurrentTemplates([updatedTemplate]);

    } catch (error) {
      console.error('Error cancelling appointment:', error);
      // Show error template
      const errorTemplate = {
        id: 'error-cancel',
        name: 'Cancel Error',
        content: 'Sorry, there was an issue cancelling your appointment. Please call us directly or visit our website to manage your appointment.',
        category: 'error',
        variables: []
      };
      setCurrentTemplates([errorTemplate]);
    }
  };

  const handleSendScript = (template: typeof fitFreeTemplate[0]) => {

    let message = template.content;

    // Get actual appointment time if available
    const getAppointmentTime = () => {
      console.log('🔍 getAppointmentTime - contact data:', {
        scheduledAppointmentAt: contact?.scheduledAppointmentAt,
        appointmentStatus: contact?.appointmentStatus
      });
      
      // Use the scheduledAppointmentAt from the contact directly
      if (contact?.scheduledAppointmentAt) {
        const appointmentDate = new Date(contact.scheduledAppointmentAt);
        console.log('🕐 Appointment date object:', appointmentDate);
        console.log('🕐 Raw scheduledAppointmentAt value:', contact.scheduledAppointmentAt);
        
        const formattedTime = appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/New_York',
          timeZoneName: 'short',
        });
        
        console.log('✅ Formatted appointment time:', formattedTime);
        return formattedTime;
      }
      
      console.log('⚠️ No scheduledAppointmentAt found on contact, using fallback');
      return 'your scheduled time';
    };

    // Replace common variables with defaults (and real appointment slots)
    const variables: Record<string, string> = {
      client_name: contact?.name || 'there',
      day_time_et: getAppointmentTime(),
      time_et: getAppointmentTime(),
      contact_uuid: contact?.uuid || '',
      ref_a: 'https://inclusivetherapists.com',
      ref_b: 'https://openpathcollective.org',
      ref_open_path: 'https://openpathcollective.org',
      ref_inclusive: 'https://inclusivetherapists.com',
      fireweed_link: 'https://fireweedcollective.org/crisis-toolkit',
      focus_label: 'your main concerns',
      slot_today: availableSlots.today ? `at ${availableSlots.today.displayTime}` : '(no slots available)',
      slot_tomorrow: availableSlots.tomorrow ? `at ${availableSlots.tomorrow.displayTime}` : '(no slots available)',
      new_time_et: 'the new time',
    };

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      message = message.replace(placeholder, value);
    });

    onSendMessage(message);
  };

  if (currentTemplates.length === 0) {
    // Check what we're waiting for
    const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastOutbound = sortedMessages.find(m => m.direction === 'OUTBOUND')?.content || '';

    let waitingMessage = "Waiting for customer response...";
    if (lastOutbound.includes("Are you in Georgia?")) {
      waitingMessage = "Waiting for response to Georgia question (1 = Yes, 2 = No)";
    } else if (lastOutbound.includes("Fit or Free first session")) {
      waitingMessage = "Waiting for response to Fit-or-Free offer (1 = Yes, 2 = No)";
    } else if (lastOutbound.includes("$150 private pay")) {
      waitingMessage = "Waiting for response to pricing (1 = Yes, 2 = Superbill, 3 = Insurance)";
    } else if (lastOutbound.includes("Main focus?")) {
      waitingMessage = "Waiting for focus area selection (1-9, 0 = Other)";
    } else if (lastOutbound.includes("get you in sooner")) {
      waitingMessage = "Waiting for response to pull-forward offer (1 = Today, 2 = Tomorrow, 3 = Keep time)";
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-yellow-700">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">{waitingMessage}</span>
          </div>
          <Button
            onClick={() => setIsDevMode(!isDevMode)}
            className="bg-gray-500 text-white px-2 py-1 text-xs"
          >
            {isDevMode ? 'Hide Dev' : 'Dev Mode'}
          </Button>
        </div>
        
        {/* Dev Panel - Available even when waiting */}
        {isDevMode && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
            <h4 className="text-xs font-semibold text-orange-800 mb-2">🛠️ Dev Tools - Override Waiting State</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button
                onClick={() => {
                  const template = fitFreeTemplate.find(t => t.id === '1');
                  if (template) setCurrentTemplates([template]);
                }}
                className="bg-green-200 text-green-800 px-2 py-1 text-xs"
              >
                📝 Confirmation (Start)
              </Button>
              <Button
                onClick={() => {
                  const template = fitFreeTemplate.find(t => t.id === '2');
                  if (template) setCurrentTemplates([template]);
                }}
                className="bg-orange-200 text-orange-800 px-2 py-1 text-xs"
              >
                🌎 Georgia Question
              </Button>
              <Button
                onClick={() => {
                  const template = fitFreeTemplate.find(t => t.id === '3');
                  if (template) setCurrentTemplates([template]);
                }}
                className="bg-orange-200 text-orange-800 px-2 py-1 text-xs"
              >
                💰 Fit-or-Free Offer
              </Button>
              <Button
                onClick={() => {
                  const template = fitFreeTemplate.find(t => t.id === '5');
                  if (template) setCurrentTemplates([template]);
                }}
                className="bg-orange-200 text-orange-800 px-2 py-1 text-xs"
              >
                📋 Focus Areas
              </Button>
              <Button
                onClick={() => {
                  const template = fitFreeTemplate.find(t => t.id === '7');
                  if (template) {
                    setCurrentTemplates([template]);
                    loadAvailableSlots();
                  }
                }}
                className="bg-purple-200 text-purple-800 px-2 py-1 text-xs"
              >
                ⏰ Pull Forward
              </Button>
              <Button
                onClick={() => {
                  const template = fitFreeTemplate.find(t => t.id === '8');
                  if (template) setCurrentTemplates([template]);
                }}
                className="bg-red-200 text-red-800 px-2 py-1 text-xs"
              >
                ❌ Cancel Appointment
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Next Script Options</h3>
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDevMode(!isDevMode)}
            className="bg-gray-500 text-white px-2 py-1 text-xs"
          >
            {isDevMode ? 'Hide Dev' : 'Dev Mode'}
          </Button>
          {isDevMode && (
            <Button
              onClick={handleRestartFlow}
              className="bg-orange-600 text-white px-2 py-1 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Restart Flow
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {currentTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  ID: {template.id}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {template.name}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>
              <Button
                onClick={() => handleSendScript(template)}
                className="bg-blue-600 text-white px-3 py-1 text-xs hover:bg-blue-700"
              >
                <Send className="w-3 h-3 mr-1" />
                Send
              </Button>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap border-l-2 border-blue-200 pl-3">
              {template.content}
            </p>
            {template.variables.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                Variables: {template.variables.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-blue-600 bg-blue-100 rounded p-2">
        💡 Scripts automatically update based on customer responses in the conversation flow
        {messages.length > lastMessageCount && (
          <span className="ml-2 text-green-600 font-medium">🔄 Updating...</span>
        )}
      </div>

      {/* Dev Panel */}
      {isDevMode && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
          <h4 className="text-xs font-semibold text-orange-800 mb-2">🛠️ Dev Tools</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Button
              onClick={() => {
                const template = fitFreeTemplate.find(t => t.id === '1');
                if (template) setCurrentTemplates([template]);
              }}
              className="bg-green-200 text-green-800 px-2 py-1 text-xs"
            >
              📝 Confirmation (Start)
            </Button>
            <Button
              onClick={() => {
                const template = fitFreeTemplate.find(t => t.id === '2');
                if (template) setCurrentTemplates([template]);
              }}
              className="bg-orange-200 text-orange-800 px-2 py-1 text-xs"
            >
              🌎 Georgia Question
            </Button>
            <Button
              onClick={() => {
                const template = fitFreeTemplate.find(t => t.id === '3');
                if (template) setCurrentTemplates([template]);
              }}
              className="bg-orange-200 text-orange-800 px-2 py-1 text-xs"
            >
              💡 Fit-or-Free
            </Button>
            <Button
              onClick={() => {
                const template = fitFreeTemplate.find(t => t.id === '5');
                if (template) setCurrentTemplates([template]);
              }}
              className="bg-orange-200 text-orange-800 px-2 py-1 text-xs"
            >
              🎯 Focus Menu
            </Button>
            <Button
              onClick={() => {
                const template = fitFreeTemplate.find(t => t.id === '7');
                if (template) {
                  setCurrentTemplates([template]);
                  loadAvailableSlots();
                }
              }}
              className="bg-orange-200 text-orange-800 px-2 py-1 text-xs"
            >
              ⏰ Pull-Forward
            </Button>
            <Button
              onClick={() => {
                console.log('🔍 Current conversation state:', {
                  messageCount: messages.length,
                  lastMessageCount,
                  availableSlots,
                  currentTemplates: currentTemplates.map(t => ({ id: t.id, name: t.name }))
                });
              }}
              className="bg-blue-200 text-blue-800 px-2 py-1 text-xs"
            >
              🔍 Debug State
            </Button>
          </div>
          <div className="mt-2 text-xs text-orange-600">
            Messages: {messages.length} | Last Count: {lastMessageCount}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptBubbles;
