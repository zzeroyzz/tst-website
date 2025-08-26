/**
 * Client-side Conversation Flow Manager
 * Client-safe functions for the CRM interface
 */

import { getQuickResponseButtons, type QuickResponseButton, type ConversationState } from './flow-manager';

// Re-export types for client use
export type { QuickResponseButton, ConversationState };

/**
 * Client-safe function to get quick response buttons
 * This doesn't require database access
 */
export function getQuickResponseButtonsClient(
  currentStepId: string,
  variables: Record<string, string> = {}
): QuickResponseButton[] {
  return getQuickResponseButtons(currentStepId, variables);
}

/**
 * Get conversation state via API call (client-safe)
 */
export async function getConversationStateClient(contactId: string): Promise<ConversationState | null> {
  try {
    const response = await fetch('/api/conversation/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversation state');
    }
    
    const data = await response.json();
    return data.conversationState;
  } catch (error) {
    console.error('Error fetching conversation state:', error);
    return null;
  }
}

/**
 * Process user response via API call (client-safe)
 */
export async function processUserResponseClient(
  contactId: string,
  userResponse: string,
  selectedStepId?: string
): Promise<ConversationState> {
  try {
    const response = await fetch('/api/conversation/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, userResponse, selectedStepId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process user response');
    }
    
    const data = await response.json();
    return data.conversationState;
  } catch (error) {
    console.error('Error processing user response:', error);
    throw error;
  }
}