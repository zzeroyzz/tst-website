/**
 * Cron Job: Process Automated SMS Workflows
 * Handles appointment reminders, missed appointments, questionnaire follow-ups
 */

import { NextRequest, NextResponse } from 'next/server';
import { processAutomatedWorkflows } from '@/lib/twilio/workflow-triggers';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not properly configured' },
        { status: 500 }
      );
    }

    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      console.error('Invalid cron authorization');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Processing automated SMS workflows...');
    const startTime = Date.now();

    // Process all automated workflows
    const results = await processAutomatedWorkflows();

    const processingTime = Date.now() - startTime;

    console.log('Workflow processing completed:', {
      totalProcessed: results.totalProcessed,
      breakdown: results.breakdown,
      errors: results.errors.length,
      processingTimeMs: processingTime,
    });

    return NextResponse.json({
      success: true,
      totalProcessed: results.totalProcessed,
      breakdown: results.breakdown,
      errors: results.errors,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Critical error in workflow processing:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET method for manual testing
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    console.log('Manual workflow processing triggered...');
    const results = await processAutomatedWorkflows();

    return NextResponse.json({
      success: true,
      message: 'Manual workflow processing completed',
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in manual workflow processing:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}