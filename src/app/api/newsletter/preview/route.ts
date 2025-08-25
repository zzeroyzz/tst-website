// src/app/api/newsletter/preview/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import { getEmailHtml } from '@/lib/email-template';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

marked.setOptions({
  breaks: true,
  gfm: true,
});

export async function POST(request: Request) {
  try {
    const postData = await request.json();
    if (!postData) {
      return NextResponse.json(
        { error: 'Post data is required.' },
        { status: 400 }
      );
    }

    const { data: archivePosts, error: archiveError } = await supabase
      .from('posts')
      .select('title, image_url, slug, subtext')
      .in('id', postData.archive_posts || []);
    if (archiveError)
      throw new Error(`Error fetching archive posts: ${archiveError.message}`);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const emailData = {
      header_title: postData.title || 'A note on healing',
      formatted_date: formattedDate,
      main_image_url:
        postData.image_url ||
        'https://placehold.co/640x360/F9F5F2/000000?text=Main+Article+Image',
      main_title: postData.title,
      main_body: marked.parse(postData.body || ''),
      toasty_take: postData.toasty_take,
      archive_posts: archivePosts || [],
    };

    const finalHtml = getEmailHtml(emailData);

    return NextResponse.json({ html: finalHtml });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error:', errorMessage);
    return NextResponse.json(
      { error: `Preview generation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
