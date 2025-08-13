// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

interface Post {
  slug: string;
  sent_at: string | null;
  created_at: string;
  status?: string;
  archived?: boolean;
  visible_to_public?: boolean;
}

export const revalidate = 86400; // 24h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // This route runs server-side only, so SRK is not exposed to the browser.
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const baseUrl = 'https://toastedsesametherapy.com';
  const nowIso = new Date().toISOString();

  // Fetch only posts that should appear publicly
  const { data: posts, error } = await supabase
    .from('posts')
    .select('slug, sent_at, created_at, status, archived, visible_to_public')
    .eq('status', 'published')
    .eq('archived', false)
    .eq('visible_to_public', true);

  if (error) {
    console.error('sitemap: error fetching posts', error);
  }

  const safeIso = (d?: string | null) => {
    if (!d) return nowIso;
    const t = new Date(d);
    return isNaN(t.getTime()) ? nowIso : t.toISOString();
  };

  const postUrls: MetadataRoute.Sitemap =
    (posts as Post[] | null)?.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: safeIso(post.sent_at ?? post.created_at),
      changeFrequency: 'monthly',
      priority: 0.8,
    })) ?? [];

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: nowIso, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: nowIso, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/therapy-services`, lastModified: nowIso, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: nowIso, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: nowIso, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/mental-health-healing-blog`, lastModified: nowIso, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/policy`, lastModified: nowIso, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [...staticUrls, ...postUrls];
}
