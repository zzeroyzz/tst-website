// src/app/api/cron/cleanup-appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify this is actually a cron job request from Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('[cleanup-cron] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[cleanup-cron] Starting scheduled appointment cleanup...');

    // Call our cleanup API internally
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cleanupUrl = `${baseUrl}/api/appointment/cleanup-past`;

    const response = await fetch(cleanupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[cleanup-cron] Cleanup failed:', result);
      return NextResponse.json(
        { error: 'Cleanup failed', details: result },
        { status: 500 }
      );
    }

    console.log('[cleanup-cron] Cleanup completed successfully:', result);

    return NextResponse.json({
      success: true,
      cronExecutedAt: new Date().toISOString(),
      cleanupResult: result
    });

  } catch (error) {
    console.error('[cleanup-cron] Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}