/**
 * Server-side Conversation Flow Manager
 * Server-only functions that require service role access
 */

import { createClient } from '@supabase/supabase-js';
import { 
  initializeConversation, 
  getConversationState, 
  processUserResponse,
  type ConversationState 
} from './flow-manager';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Server-side wrapper for getting conversation state
 */
export async function getConversationStateServer(contactId: string): Promise<ConversationState | null> {
  return getConversationState(contactId, supabase);
}

/**
 * Server-side wrapper for initializing conversation
 */
export async function initializeConversationServer(
  contactId: string,
  appointmentDateTime: string,
  contactName: string
): Promise<ConversationState> {
  return initializeConversation(contactId, appointmentDateTime, contactName, supabase);
}

/**
 * Server-side wrapper for processing user response
 */
export async function processUserResponseServer(
  contactId: string,
  userResponse: string,
  selectedStepId?: string
): Promise<ConversationState> {
  return processUserResponse(contactId, userResponse, supabase, selectedStepId);
}