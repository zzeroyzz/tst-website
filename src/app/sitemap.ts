// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

interface Post {
  slug: string;
  sent_at: string | null;
  created_at: string;
}

export const revalidate = 86400; // 24h; adjust as you like
// export const dynamic = 'force-static'; // optional if you want static generation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,                // keep secrets server-side
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const baseUrl = 'https://toastedsesametherapy.com';

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, sent_at, created_at')
    .eq('status', 'published');

  const safeIso = (d: string) => {
    const t = new Date(d);
    return isNaN(t.getTime()) ? new Date().toISOString() : t.toISOString();
  };

  const postUrls: MetadataRoute.Sitemap = (posts as Post[] | null)?.map(post => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: safeIso(post.sent_at ?? post.created_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  })) ?? [];

  const nowIso = new Date().toISOString();
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: nowIso, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: nowIso, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/therapy-services`, lastModified: nowIso, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: nowIso, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: nowIso, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/toasty-tidbits-archives`, lastModified: nowIso, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/policy`, lastModified: nowIso, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [...staticUrls, ...postUrls];
}
