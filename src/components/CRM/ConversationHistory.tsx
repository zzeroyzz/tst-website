'use client';

import React from 'react';
import { User, MessageCircle, Clock } from 'lucide-react';

interface ConversationHistoryProps {
  contact: any;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ contact }) => {
  const conversationResponses = contact?.custom_fields?.conversation_responses || {};
  
  if (Object.keys(conversationResponses).length === 0) {
    return null;
  }

  const responseOrder = [
    'georgia_location',
    'fit_or_free_offer', 
    'private_pay_rate',
    'main_focus',
    'pull_forward_offer'
  ];

  const orderedResponses = responseOrder
    .map(key => ({ key, ...conversationResponses[key] }))
    .filter(item => item.question);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-800 text-sm">Conversation History</h4>
      </div>
      
      <div className="space-y-2">
        {orderedResponses.map((item) => (
          <div key={item.key} className="flex justify-between items-center py-1 px-2 bg-white rounded text-xs">
            <div className="flex-1">
              <span className="text-gray-600">{item.question}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{item.response}</span>
              {item.timestamp && (
                <span className="text-gray-400 text-xs">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationHistory;