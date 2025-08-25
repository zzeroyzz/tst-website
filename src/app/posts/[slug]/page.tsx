// src/app/posts/[slug]/page.tsx
import { createClient } from '@supabase/supabase-js';
import PostPageClient from '@/components/clients/PostPageClient/PostPageClient';
import type { Metadata } from 'next';

// Define the expected props shape for this page
// Updated to match Next.js 15 App Router requirements
type Props = {
  params: Promise<{ slug: string }>;
};

// Type for the minimal post data needed for metadata
type PostMetadata = {
  title: string;
  subtext?: string;
  image_url?: string;
  created_at: string;
  sent_at?: string;
};

// Helper function to fetch post data on the server
async function getPost(slug: string): Promise<PostMetadata | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from('posts')
    .select('title, subtext, image_url, created_at, sent_at')
    .eq('slug', slug)
    .single();
  return data;
}

// Generate the dynamic page title and description
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // Await the params promise
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }

  return {
    title: `${post.title} | Toasted Sesame Therapy`,
    description:
      post.subtext || 'A reflection from the Toasty Tidbits newsletter.',
  };
}

// This is the main server component for the page
export default async function PostPage({ params }: Props) {
  const { slug } = await params; // Await the params promise
  const post = await getPost(slug);

  if (!post) {
    return <PostPageClient />;
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description:
      post.subtext || 'A reflection from the Toasty Tidbits newsletter.',
    image:
      post.image_url ||
      'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/cho-cloud-hero.png',
    author: {
      '@type': 'Person',
      name: 'Kay',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Toasted Sesame Therapy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg',
      },
    },
    datePublished: post.created_at,
    dateModified: post.sent_at || post.created_at,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PostPageClient />
    </>
  );
}
