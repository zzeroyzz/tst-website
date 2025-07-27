// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Define the shape of a post for our sitemap
interface Post {
  slug: string;
  sent_at: string | null;
  created_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const baseUrl = 'https://toastedsesametherapy.com';

  // Fetch all published posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, sent_at, created_at')
    .eq('status', 'published');

  const postUrls = (posts as Post[] | null)?.map(post => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.sent_at || post.created_at).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  })) ?? [];

  // Define static pages
  const staticUrls = [
    { url: baseUrl, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/therapy-services`, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date().toISOString(), changeFrequency: 'yearly' as const, priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/toasty-tidbits-archives`, lastModified: new Date().toISOString(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/policy`, lastModified: new Date().toISOString(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  return [...staticUrls, ...postUrls];
}
