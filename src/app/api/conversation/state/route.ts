/**
 * API endpoint to get conversation state
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConversationStateServer } from '@/lib/conversations/flow-manager-server';

export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();
    
    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }
    
    const conversationState = await getConversationStateServer(contactId);
    
    return NextResponse.json({
      success: true,
      conversationState,
    });
  } catch (error) {
    console.error('Error getting conversation state:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}