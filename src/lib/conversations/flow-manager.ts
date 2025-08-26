/**
 * Conversation Flow Manager
 * Manages the human-in-the-loop conversational flow using fitFreeTemplateData
 */

import { fitFreeTemplate } from '@/data/fitFreeTemplateData';

export interface ConversationStep {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  nextSteps?: ConversationStep[];
  userResponses?: { [key: string]: string }; // Maps response to next step ID
}

export interface ConversationState {
  contactId: string;
  currentStepId: string;
  history: ConversationHistoryItem[];
  variables: Record<string, string>;
  awaitingResponse: boolean;
  lastMessageAt: Date;
}

export interface ConversationHistoryItem {
  stepId: string;
  userResponse?: string;
  messageContent: string;
  timestamp: Date;
  sentBy: 'system' | 'agent';
}

export interface QuickResponseButton {
  id: string;
  label: string;
  messageContent: string;
  nextStepId?: string;
  action?: 'send_message' | 'reschedule' | 'cancel';
  category: 'primary' | 'secondary' | 'warning';
}

/**
 * Convert fitFreeTemplate data to conversation steps with flow logic
 */
export function buildConversationFlow(): Map<string, ConversationStep> {
  const flowMap = new Map<string, ConversationStep>();
  
  // Convert template data to conversation steps
  fitFreeTemplate.forEach(template => {
    flowMap.set(template.id, {
      id: template.id,
      name: template.name,
      category: template.category,
      content: template.content,
      variables: template.variables,
    });
  });
  
  // Define conversation flow logic
  defineFlowLogic(flowMap);
  
  return flowMap;
}

/**
 * Define the flow logic between conversation steps
 */
function defineFlowLogic(flowMap: Map<string, ConversationStep>) {
  // Initial confirmation step
  const confirmation = flowMap.get('1');
  if (confirmation) {
    confirmation.userResponses = {
      '2': '18', // RESCHEDULE -> Auto-Reply RESCHEDULE
      '3': '19', // CANCEL -> Auto-Reply CANCEL
      'RESCHEDULE': '18',
      'CANCEL': '19',
      'HELP': '20',
      'default': '2', // Continue to state qualification
    };
  }
  
  // State qualification
  const stateQualification = flowMap.get('2');
  if (stateQualification) {
    stateQualification.userResponses = {
      '1': '4', // Yes -> Fit or Free offer
      '2': '3', // No -> Referrals
    };
  }
  
  // Fit or Free offer
  const fitOrFree = flowMap.get('4');
  if (fitOrFree) {
    fitOrFree.userResponses = {
      '1': '5', // Yes -> Private pay rate
      '2': '7', // No -> Insurance referrals
    };
  }
  
  // Private pay rate
  const privatePayRate = flowMap.get('5');
  if (privatePayRate) {
    privatePayRate.userResponses = {
      '1': '8', // Yes -> Main focus menu
      '2': '6', // What's a superbill
      '3': '7', // Prefer insurance referrals
    };
  }
  
  // Superbill explanation
  const superbillExplanation = flowMap.get('6');
  if (superbillExplanation) {
    superbillExplanation.userResponses = {
      '1': '8', // Yes -> Main focus menu
      '2': '7', // Prefer insurance referrals
    };
  }
  
  // Main focus menu
  const mainFocus = flowMap.get('8');
  if (mainFocus) {
    const focusLabels: Record<string, string> = {
      '1': 'Anxiety',
      '2': 'Trauma', 
      '3': 'Burnout',
      '4': 'Self-Esteem',
      '5': 'Relationships',
      '6': 'Transitions',
      '7': 'Identity',
      '8': 'ND Support',
      '9': 'Stress',
      '0': 'Other',
    };
    
    mainFocus.userResponses = {};
    Object.keys(focusLabels).forEach(key => {
      mainFocus.userResponses![key] = '9'; // All go to acknowledgement
    });
  }
  
  // Focus acknowledgement leads to pull-forward or scheduling
  const focusAck = flowMap.get('9');
  if (focusAck) {
    focusAck.userResponses = {
      'default': '10', // Pull-forward offer
    };
  }
  
  // Pull-forward offer
  const pullForward = flowMap.get('10');
  if (pullForward) {
    pullForward.userResponses = {
      '1': '11', // Today -> Moved confirmation
      '2': '11', // Tomorrow -> Moved confirmation  
      '3': '12', // Keep current time
    };
  }
  
  // Reschedule auto-reply
  const rescheduleReply = flowMap.get('18');
  if (rescheduleReply) {
    rescheduleReply.userResponses = {
      '1': '11', // Earliest today -> Moved
      '2': '11', // Earliest tomorrow -> Moved
      '3': '12', // Keep current time
    };
  }
}

/**
 * Get conversation state for a contact
 */
export async function getConversationState(contactId: string, supabase: any): Promise<ConversationState | null> {
  try {
    const { data, error } = await supabase
      .from('conversation_states')
      .select('*')
      .eq('contact_id', contactId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      contactId: data.contact_id,
      currentStepId: data.current_step_id,
      history: data.history || [],
      variables: data.variables || {},
      awaitingResponse: data.awaiting_response,
      lastMessageAt: new Date(data.last_message_at),
    };
  } catch (error) {
    console.error('Error getting conversation state:', error);
    // If the table doesn't exist, return null (no conversation state)
    if ((error as any)?.code === '42P01') {
      console.warn('conversation_states table does not exist');
      return null;
    }
    return null;
  }
}

/**
 * Initialize conversation for a new contact (send welcome message)
 */
export async function initializeConversation(
  contactId: string,
  appointmentDateTime: string,
  contactName: string,
  supabase: any
): Promise<ConversationState> {
  const flowMap = buildConversationFlow();
  const initialStep = flowMap.get('1'); // Confirmation message
  
  if (!initialStep) {
    throw new Error('Initial conversation step not found');
  }
  
  // Create variables for the welcome message
  const appointmentDate = new Date(appointmentDateTime);
  const dayTimeEt = appointmentDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });
  
  // Get contact UUID for reschedule link
  const { data: contact } = await supabase
    .from('contacts')
    .select('uuid')
    .eq('id', contactId)
    .single();
  
  const manageLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://toastedsesametherapy.com'}/reschedule/${contact?.uuid || 'unknown'}`;
  
  const variables = {
    client_name: contactName,
    day_time_et: dayTimeEt,
    manage_link: manageLink,
  };
  
  // Replace variables in content
  const messageContent = replaceVariables(initialStep.content, variables);
  
  const conversationState: ConversationState = {
    contactId,
    currentStepId: '1',
    history: [{
      stepId: '1',
      messageContent,
      timestamp: new Date(),
      sentBy: 'system',
    }],
    variables,
    awaitingResponse: true,
    lastMessageAt: new Date(),
  };
  
  // Save conversation state to database
  await saveConversationState(conversationState, supabase);
  
  // Save the welcome message to crm_messages table for CRM interface
  try {
    // Try with contact_uuid first, fall back to just contact_id
    const messageData = {
      contact_id: parseInt(contactId),
      content: messageContent,
      direction: 'OUTBOUND',
      message_status: 'SENT',
      message_type: 'SMS',
      created_at: new Date().toISOString(),
    };

    // Add contact_uuid if available
    if (contact?.uuid) {
      (messageData as any).contact_uuid = contact.uuid;
    }

    await supabase.from('crm_messages').insert([messageData]);
  } catch (error) {
    console.error('Error saving welcome message to CRM:', error);
    // If it fails due to contact_uuid column, try again without it
    if ((error as any)?.code === '42703') {
      try {
        await supabase.from('crm_messages').insert([
          {
            contact_id: parseInt(contactId),
            content: messageContent,
            direction: 'OUTBOUND',
            message_status: 'SENT',
            message_type: 'SMS',
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (fallbackError) {
        console.error('Error saving welcome message to CRM (fallback):', fallbackError);
      }
    }
  }
  
  return conversationState;
}

/**
 * Get quick response buttons for current conversation step
 */
export function getQuickResponseButtons(
  currentStepId: string,
  variables: Record<string, string> = {}
): QuickResponseButton[] {
  const flowMap = buildConversationFlow();
  const currentStep = flowMap.get(currentStepId);
  
  if (!currentStep) {
    return [];
  }
  
  const buttons: QuickResponseButton[] = [];
  
  // Generate buttons based on the step content and expected responses
  switch (currentStepId) {
    case '2': // State qualification
      buttons.push(
        { id: '1', label: 'Yes (Georgia)', messageContent: 'Yes', nextStepId: '4', category: 'primary' },
        { id: '2', label: 'No (Not in Georgia)', messageContent: 'No', nextStepId: '3', category: 'secondary' }
      );
      break;
      
    case '4': // Fit or Free offer
      buttons.push(
        { id: '1', label: 'Yes (Fit or Free)', messageContent: 'Yes', nextStepId: '5', category: 'primary' },
        { id: '2', label: 'No (Not interested)', messageContent: 'No', nextStepId: '7', category: 'secondary' }
      );
      break;
      
    case '5': // Private pay rate
      buttons.push(
        { id: '1', label: 'Yes ($150)', messageContent: 'Yes', nextStepId: '8', category: 'primary' },
        { id: '2', label: 'What\'s a superbill?', messageContent: 'What\'s a superbill?', nextStepId: '6', category: 'secondary' },
        { id: '3', label: 'Prefer insurance', messageContent: 'Prefer insurance referrals', nextStepId: '7', category: 'secondary' }
      );
      break;
      
    case '6': // Superbill explanation
      buttons.push(
        { id: '1', label: 'Yes (Private pay)', messageContent: 'Yes', nextStepId: '8', category: 'primary' },
        { id: '2', label: 'Prefer insurance', messageContent: 'Prefer insurance referrals', nextStepId: '7', category: 'secondary' }
      );
      break;
      
    case '8': // Main focus menu
      const focusOptions = [
        { id: '1', label: 'Anxiety', category: 'primary' as const },
        { id: '2', label: 'Trauma', category: 'primary' as const },
        { id: '3', label: 'Burnout', category: 'primary' as const },
        { id: '4', label: 'Self-Esteem', category: 'primary' as const },
        { id: '5', label: 'Relationships', category: 'primary' as const },
        { id: '6', label: 'Transitions', category: 'primary' as const },
        { id: '7', label: 'Identity', category: 'primary' as const },
        { id: '8', label: 'ND Support', category: 'primary' as const },
        { id: '9', label: 'Stress', category: 'primary' as const },
        { id: '0', label: 'Other', category: 'secondary' as const },
      ];
      
      focusOptions.forEach(option => {
        buttons.push({
          id: option.id,
          label: option.label,
          messageContent: option.label,
          nextStepId: '9',
          category: option.category,
        });
      });
      break;
      
    case '10': // Pull-forward offer
    case '18': // Reschedule auto-reply
      buttons.push(
        { id: '1', label: 'Today', messageContent: 'Today', nextStepId: '11', category: 'primary' },
        { id: '2', label: 'Tomorrow', messageContent: 'Tomorrow', nextStepId: '11', category: 'primary' },
        { id: '3', label: 'Keep current time', messageContent: 'Keep current time', nextStepId: '12', category: 'secondary' }
      );
      break;
      
    case '13': // Same day confirmation
    case '14': // T-60 reminder  
    case '15': // Next day confirm
      buttons.push(
        { id: '1', label: 'Yes (confirmed)', messageContent: 'Yes', category: 'primary' },
        { id: '2', label: 'Reschedule', messageContent: 'Reschedule', nextStepId: '18', category: 'secondary' }
      );
      break;
      
    case '16': // Last chance
      buttons.push(
        { id: '1', label: 'I\'ll be there', messageContent: 'I\'ll be there', category: 'primary' },
        { id: '2', label: 'Reschedule', messageContent: 'Reschedule', nextStepId: '18', category: 'secondary' },
        { id: '3', label: 'Cancel', messageContent: 'Cancel', nextStepId: '19', category: 'warning' }
      );
      break;
      
    default:
      // For steps without specific responses, add common options
      buttons.push(
        { id: 'continue', label: 'Continue conversation', messageContent: 'Continue', category: 'primary' }
      );
      break;
  }
  
  // Always add standard options
  buttons.push(
    { id: 'reschedule', label: 'Reschedule', messageContent: 'RESCHEDULE', nextStepId: '18', category: 'secondary' },
    { id: 'cancel', label: 'Cancel', messageContent: 'CANCEL', nextStepId: '19', category: 'warning' },
    { id: 'help', label: 'Help', messageContent: 'HELP', nextStepId: '20', category: 'secondary' }
  );
  
  return buttons;
}

/**
 * Process user response and advance conversation
 */
export async function processUserResponse(
  contactId: string,
  userResponse: string,
  supabase: any,
  selectedStepId?: string
): Promise<ConversationState> {
  const currentState = await getConversationState(contactId, supabase);
  
  if (!currentState) {
    throw new Error('Conversation state not found');
  }
  
  const flowMap = buildConversationFlow();
  const currentStep = flowMap.get(currentState.currentStepId);
  
  if (!currentStep) {
    throw new Error('Current step not found in flow');
  }
  
  // Determine next step
  let nextStepId = selectedStepId;
  
  if (!nextStepId && currentStep.userResponses) {
    nextStepId = currentStep.userResponses[userResponse] || currentStep.userResponses['default'];
  }
  
  // Update conversation state
  const updatedState: ConversationState = {
    ...currentState,
    currentStepId: nextStepId || currentState.currentStepId,
    history: [
      ...currentState.history,
      {
        stepId: currentState.currentStepId,
        userResponse,
        messageContent: userResponse,
        timestamp: new Date(),
        sentBy: 'agent',
      }
    ],
    awaitingResponse: false,
    lastMessageAt: new Date(),
  };
  
  // Update variables if needed (e.g., focus selection)
  if (currentState.currentStepId === '8' && userResponse) {
    const focusLabels: Record<string, string> = {
      '1': 'Anxiety', '2': 'Trauma', '3': 'Burnout', '4': 'Self-Esteem',
      '5': 'Relationships', '6': 'Transitions', '7': 'Identity', 
      '8': 'ND Support', '9': 'Stress', '0': 'Other'
    };
    
    updatedState.variables.focus_label = focusLabels[userResponse] || userResponse;
  }
  
  // Save updated state
  await saveConversationState(updatedState, supabase);
  
  // Save the user response to crm_messages table for CRM interface
  try {
    // Get contact UUID
    const { data: contact } = await supabase
      .from('contacts')
      .select('uuid')
      .eq('id', contactId)
      .single();
    
    // Try with contact_uuid first, fall back to just contact_id
    const messageData = {
      contact_id: parseInt(contactId),
      content: userResponse,
      direction: 'OUTBOUND', // This is the agent's response/selection
      message_status: 'SENT',
      message_type: 'SMS',
      created_at: new Date().toISOString(),
    };

    // Add contact_uuid if available
    if (contact?.uuid) {
      (messageData as any).contact_uuid = contact.uuid;
    }

    await supabase.from('crm_messages').insert([messageData]);
  } catch (error) {
    console.error('Error saving agent response to CRM:', error);
    // If it fails due to contact_uuid column, try again without it
    if ((error as any)?.code === '42703') {
      try {
        await supabase.from('crm_messages').insert([
          {
            contact_id: parseInt(contactId),
            content: userResponse,
            direction: 'OUTBOUND',
            message_status: 'SENT',
            message_type: 'SMS',
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (fallbackError) {
        console.error('Error saving agent response to CRM (fallback):', fallbackError);
      }
    }
  }
  
  return updatedState;
}

/**
 * Replace variables in message content
 */
export function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return result;
}

/**
 * Save conversation state to database
 */
async function saveConversationState(state: ConversationState, supabase: any): Promise<void> {
  try {
    await supabase
      .from('conversation_states')
      .upsert([{
        contact_id: state.contactId,
        current_step_id: state.currentStepId,
        history: state.history,
        variables: state.variables,
        awaiting_response: state.awaitingResponse,
        last_message_at: state.lastMessageAt.toISOString(),
        updated_at: new Date().toISOString(),
      }]);
  } catch (error) {
    console.error('Error saving conversation state:', error);
    // If the table doesn't exist, we'll just log and continue
    // The conversation will still work, just without persistent state
    if ((error as any)?.code === '42P01') {
      console.warn('conversation_states table does not exist - conversation state not persisted');
      return;
    }
    throw error;
  }
}