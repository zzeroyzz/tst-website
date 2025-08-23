// src/app/api/posts/[slug]/view/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const headersList = await headers();

    // Get user's IP address
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0]
      : headersList.get('x-real-ip') || '127.0.0.1';

    const userAgent = headersList.get('user-agent') || 'Unknown';

    // Call the stored function to increment views
    const { data, error } = await supabase.rpc('increment_post_views', {
      post_slug: slug,
      viewer_ip_addr: ip,
      user_agent_str: userAgent,
    });

    if (error) {
      console.error('Error incrementing views:', error);
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      );
    }

    return NextResponse.json({ view_count: data });
  } catch (error) {
    console.error('Error in view tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
