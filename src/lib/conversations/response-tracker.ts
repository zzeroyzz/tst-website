/**
 * Tracks and saves conversation responses to the contact record
 */

export interface ConversationResponse {
  questionId: string;
  question: string;
  response: string;
  responseValue?: string;
  timestamp?: string;
}

export async function saveConversationResponse(
  contactId: string,
  questionId: string,
  question: string,
  response: string,
  responseValue?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await fetch('/api/conversation/save-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactId,
        questionId,
        question,
        response,
        responseValue
      }),
    });

    if (!result.ok) {
      const errorData = await result.json();
      return { success: false, error: errorData.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving conversation response:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Analyze a message to extract conversation response data
 */
export function analyzeMessageForResponse(
  outboundMessage: string,
  inboundMessage: string
): { questionId: string; question: string; response: string; responseValue?: string } | null {
  const inbound = inboundMessage.toLowerCase().trim();
  
  // Georgia question
  if (outboundMessage.includes("Are you in Georgia?")) {
    let response = '';
    let responseValue = '';
    
    if (inbound.includes('1') || inbound.includes('yes')) {
      response = 'Yes - in Georgia';
      responseValue = 'yes';
    } else if (inbound.includes('2') || inbound.includes('no')) {
      response = 'No - not in Georgia';
      responseValue = 'no';
    } else {
      response = inboundMessage;
      responseValue = inbound;
    }
    
    return {
      questionId: 'georgia_location',
      question: 'Are you in Georgia?',
      response,
      responseValue
    };
  }
  
  // Fit-or-Free question
  if (outboundMessage.includes("Fit or Free first session")) {
    let response = '';
    let responseValue = '';
    
    if (inbound.includes('1') || inbound.includes('yes')) {
      response = 'Yes - interested in Fit or Free';
      responseValue = 'yes';
    } else if (inbound.includes('2') || inbound.includes('no')) {
      response = 'No - not interested in Fit or Free';
      responseValue = 'no';
    } else {
      response = inboundMessage;
      responseValue = inbound;
    }
    
    return {
      questionId: 'fit_or_free_offer',
      question: 'Interested in Fit or Free first session?',
      response,
      responseValue
    };
  }
  
  // Private pay question
  if (outboundMessage.includes("$150 private pay")) {
    let response = '';
    let responseValue = '';
    
    if (inbound.includes('1') || inbound.includes('yes')) {
      response = 'Yes - proceed with private pay';
      responseValue = 'proceed';
    } else if (inbound.includes('2') || inbound.includes('superbill')) {
      response = 'What is a superbill?';
      responseValue = 'superbill_question';
    } else if (inbound.includes('3') || inbound.includes('insurance')) {
      response = 'Prefer insurance referrals';
      responseValue = 'insurance_referrals';
    } else {
      response = inboundMessage;
      responseValue = inbound;
    }
    
    return {
      questionId: 'private_pay_rate',
      question: 'Proceed with $150 private pay?',
      response,
      responseValue
    };
  }
  
  // Main focus question
  if (outboundMessage.includes("Main focus?")) {
    const focusMap: Record<string, { label: string; value: string }> = {
      '1': { label: 'Anxiety', value: 'anxiety' },
      '2': { label: 'Trauma', value: 'trauma' },
      '3': { label: 'Burnout', value: 'burnout' },
      '4': { label: 'Self-Esteem', value: 'self_esteem' },
      '5': { label: 'Relationships', value: 'relationships' },
      '6': { label: 'Transitions', value: 'transitions' },
      '7': { label: 'Identity', value: 'identity' },
      '8': { label: 'ND Support', value: 'nd_support' },
      '9': { label: 'Stress', value: 'stress' },
      '0': { label: 'Other', value: 'other' }
    };
    
    const selectedOptions: string[] = [];
    const selectedValues: string[] = [];
    
    // Check each digit in the response
    for (const digit of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
      if (inbound.includes(digit)) {
        selectedOptions.push(focusMap[digit].label);
        selectedValues.push(focusMap[digit].value);
      }
    }
    
    const response = selectedOptions.length > 0 ? selectedOptions.join(', ') : inboundMessage;
    const responseValue = selectedValues.length > 0 ? selectedValues.join(',') : inbound;
    
    return {
      questionId: 'main_focus',
      question: 'Main focus area?',
      response,
      responseValue
    };
  }
  
  // Pull-forward question - extract actual times offered
  if (outboundMessage.includes("get you in sooner")) {
    let response = '';
    let responseValue = '';
    
    // Try to extract the actual times from the outbound message
    const todayMatch = outboundMessage.match(/1 = Today at ([^\\n]*)/);
    const tomorrowMatch = outboundMessage.match(/2 = Tomorrow at ([^\\n]*)/);
    
    const todayTime = todayMatch ? todayMatch[1] : 'available time';
    const tomorrowTime = tomorrowMatch ? tomorrowMatch[1] : 'available time';
    
    if (inbound.includes('1')) {
      response = `Move to today (${todayTime})`;
      responseValue = 'today';
    } else if (inbound.includes('2')) {
      response = `Move to tomorrow (${tomorrowTime})`;
      responseValue = 'tomorrow';
    } else if (inbound.includes('3')) {
      response = 'Keep current time';
      responseValue = 'keep_current';
    } else {
      response = inboundMessage;
      responseValue = inbound;
    }
    
    return {
      questionId: 'pull_forward_offer',
      question: 'Pull forward appointment?',
      response,
      responseValue
    };
  }
  
  return null;
}