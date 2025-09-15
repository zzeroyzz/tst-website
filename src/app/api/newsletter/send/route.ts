// src/app/api/newsletter/send/route.ts - Updated to use Resend

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import { getEmailHtml } from '@/lib/email-template';
import { sendNewsletterToAudience } from '@/lib/resend-email-sender';

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

    // 1. Save post to Supabase and set status to 'published'
    const now = new Date().toISOString();
    const dataToSave = { ...postData, status: 'published', sent_at: now };

    // Upsert logic: update if id exists, insert if not.
    const { data: savedPost, error: postError } = await supabase
      .from('posts')
      .upsert(dataToSave)
      .select()
      .single();

    if (postError) throw new Error(`Error saving post: ${postError.message}`);

    // 2. Fetch archive posts for email template
    const { data: archivePosts, error: archiveError } = await supabase
      .from('posts')
      .select('title, image_url, slug, subtext')
      .in('id', savedPost.archive_posts || []);
    if (archiveError)
      throw new Error(`Error fetching archive posts: ${archiveError.message}`);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(now));

    // 3. Prepare data for email template
    const emailData = {
      header_title: savedPost.title || 'A note on healing',
      formatted_date: formattedDate,
      main_image_url:
        savedPost.image_url ||
        'https://placehold.co/640x360/F9F5F2/000000?text=Main+Article+Image',
      main_title: savedPost.title,
      main_body: marked.parse(savedPost.body || ''),
      toasty_take: marked.parse(savedPost.toasty_take || ''),
      archive_posts: archivePosts || [],
    };

    const finalHtml = getEmailHtml(emailData);

    // 4. Send newsletter using Resend
    const newsletterResult = await sendNewsletterToAudience(
      savedPost.subject,
      finalHtml,
      'Kay from Toasted Sesame',
      'care@toastedsesametherapy.com'
    );

    if (!newsletterResult.success) {
      throw new Error(`Failed to send newsletter: ${newsletterResult.error}`);
    }

    // Return email ID, post ID, and slug for proper redirection
    return NextResponse.json({
      message: 'Newsletter sent successfully!',
      emailId: newsletterResult.emailId,
      postId: savedPost.id,
      slug: savedPost.slug, // Include the slug for redirection to public post page
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('API Error:', error.message);
    const errorMessage = error.message || 'An unexpected error occurred.';
    return NextResponse.json(
      { error: `Newsletter API Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
