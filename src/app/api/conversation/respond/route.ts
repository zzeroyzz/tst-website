/**
 * API endpoint to process conversation responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { processUserResponseServer } from '@/lib/conversations/flow-manager-server';

export async function POST(request: NextRequest) {
  try {
    const { contactId, userResponse, selectedStepId } = await request.json();
    
    if (!contactId || !userResponse) {
      return NextResponse.json(
        { error: 'Contact ID and user response are required' },
        { status: 400 }
      );
    }
    
    const conversationState = await processUserResponseServer(
      contactId,
      userResponse,
      selectedStepId
    );
    
    return NextResponse.json({
      success: true,
      conversationState,
    });
  } catch (error) {
    console.error('Error processing user response:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}