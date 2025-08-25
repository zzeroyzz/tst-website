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

  const canonical = `https://toastedsesametherapy.com/posts/${slug}`;
  
  return {
    title: `${post.title} | Toasted Sesame Therapy Blog`,
    description:
      post.subtext || 'Mental health insights and reflections from licensed therapist Kay Hernandez at Toasted Sesame Therapy.',
    keywords: [
      'mental health blog',
      'therapy insights',
      'trauma recovery',
      'self-care tips',
      'anxiety support',
      'neurodivergent support',
      'LGBTQIA+ mental health',
      'Korean American therapist',
      'Atlanta therapy'
    ].join(', '),
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.subtext || 'Mental health insights from Toasted Sesame Therapy',
      url: canonical,
      type: 'article',
      locale: 'en_US',
      siteName: 'Toasted Sesame Therapy',
      images: post.image_url ? [{ url: post.image_url }] : undefined,
      publishedTime: post.created_at,
      modifiedTime: post.sent_at || post.created_at,
      authors: ['Kay Hernandez']
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.subtext || 'Mental health insights from Toasted Sesame Therapy',
      images: post.image_url ? [post.image_url] : undefined
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// This is the main server component for the page
export default async function PostPage({ params }: Props) {
  const { slug } = await params; // Await the params promise
  const post = await getPost(slug);

  if (!post) {
    return <PostPageClient />;
  }

  const canonical = `https://toastedsesametherapy.com/posts/${slug}`;
  
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonical}#blogpost`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical
    },
    headline: post.title,
    name: post.title,
    description: post.subtext || 'Mental health insights and reflections from licensed therapist Kay Hernandez.',
    image: {
      '@type': 'ImageObject',
      url: post.image_url || 'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/cho-cloud-hero.png',
      width: 1200,
      height: 630
    },
    author: {
      '@type': 'Person',
      '@id': 'https://toastedsesametherapy.com/about#kay',
      name: 'Kay Hernandez',
      jobTitle: 'Licensed Professional Counselor',
      url: 'https://toastedsesametherapy.com/about',
      worksFor: {
        '@type': 'Organization',
        name: 'Toasted Sesame Therapy'
      }
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://toastedsesametherapy.com/#organization',
      name: 'Toasted Sesame Therapy',
      url: 'https://toastedsesametherapy.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg',
        width: 300,
        height: 100
      },
    },
    datePublished: post.created_at,
    dateModified: post.sent_at || post.created_at,
    inLanguage: 'en-US',
    about: [
      'Mental Health',
      'Therapy',
      'Self-Care',
      'Trauma Recovery',
      'Anxiety Management'
    ],
    keywords: 'mental health, therapy, self-care, trauma recovery, anxiety, depression, neurodivergent, LGBTQ',
    isPartOf: {
      '@type': 'Blog',
      '@id': 'https://toastedsesametherapy.com/mental-health-healing-blog#blog',
      name: 'Toasted Insights: Mental Health & Healing Blog'
    },
    url: canonical
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
