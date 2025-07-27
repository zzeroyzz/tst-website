// src/app/posts/[slug]/page.tsx
import { createClient } from '@supabase/supabase-js';
import PostPageClient from '@/components/PostPageClient';
import type { Metadata } from 'next';
import { Post } from '@/types'; // Import your Post type

// Helper function to fetch post data on the server
// This prevents us from having to write the same fetch logic twice
async function getPost(slug: string): Promise<Post | null> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
        .from('posts')
        .select('title, subtext, image_url, created_at, sent_at') // Fetch all fields needed for metadata and schema
        .eq('slug', slug)
        .single();
    return data;
}

// 1. Generate the dynamic page title and description
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }

  return {
    title: `${post.title} | Toasted Sesame Therapy`,
    description: post.subtext || 'A reflection from the Toasty Tidbits newsletter.',
  };
}

// 2. This is the main server component for the page
export default async function PostPage({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug);

    // If the post doesn't exist, we'll let the client component handle showing the "not found" message.
    if (!post) {
        return <PostPageClient />;
    }

    // 3. Build the Article schema JSON using the fetched post data
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.subtext || 'A reflection from the Toasty Tidbits newsletter.',
        "image": post.image_url || 'https://your-domain.com/default-social-card.png', // A fallback image is important
        "author": {
            "@type": "Person",
            "name": "Kay"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Toasted Sesame Therapy",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg"
            }
        },
        "datePublished": post.created_at,
        "dateModified": post.sent_at || post.created_at
    };

    return (
        <>
            {/* 4. Inject the schema script into the page's <head> */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            {/* 5. Render the client component to display the page content */}
            <PostPageClient />
        </>
    );
}
