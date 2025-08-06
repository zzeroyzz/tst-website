// src/app/api/posts/[slug]/like/route.ts
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
    const ip = forwarded ? forwarded.split(',')[0] :
               headersList.get('x-real-ip') ||
               '127.0.0.1';

    const userAgent = headersList.get('user-agent') || 'Unknown';

    // Call the stored function to toggle like
    const { data, error } = await supabase.rpc('toggle_post_like', {
      post_slug: slug,
      user_ip_addr: ip,
      user_agent_str: userAgent
    });

    if (error) {
      console.error('Error toggling like:', error);
      return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in like toggle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get current like status for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const headersList = await headers();

    // Get user's IP address
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] :
               headersList.get('x-real-ip') ||
               '127.0.0.1';

    // Get post data with counts
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, view_count, like_count')
      .eq('slug', slug)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user has liked this post
    const { data: likeData, error: likeError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_ip', ip)
      .single();

    return NextResponse.json({
      view_count: post.view_count || 0,
      like_count: post.like_count || 0,
      liked: !likeError && !!likeData
    });
  } catch (error) {
    console.error('Error getting post stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
