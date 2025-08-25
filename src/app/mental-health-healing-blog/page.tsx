// src/app/mental-health-healing-blog/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import BlogPageClient from '@/components/clients/BlogPageClient/BlogPageClient';

const canonical = 'https://toastedsesametherapy.com/mental-health-healing-blog';
const ogImage =
  'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/cho-cloud-hero.png'; // replace with your real OG image

export const metadata: Metadata = {
  title:
    'Toasted Insights: Mental Health & Healing Blog | Toasted Sesame Therapy',
  description:
    'Articles and resources on mental health, therapy, trauma recovery, and self‑care. Read practical guides, reflections, and our newsletter archive from Toasted Sesame Therapy.',
  keywords: [
    'mental health blog',
    'therapy blog',
    'trauma recovery',
    'self care tips',
    'anxiety support',
    'relationship mental health',
    'neurodiversity affirming',
    'Georgia online therapy',
    'Toasted Sesame Therapy',
  ],
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    siteName: 'Toasted Sesame Therapy',
    title: 'Toasted Insights: Mental Health & Healing Blog',
    description:
      'Mental health articles, therapy reflections, and self‑care guides from Toasted Sesame Therapy.',
    images: [{ url: ogImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toasted Insights: Mental Health & Healing Blog',
    description:
      'Mental health articles, therapy reflections, and self‑care guides from Toasted Sesame Therapy.',
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    // Helpful extras
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  // Optional: language hint if your app doesn't already set it globally
  // metadataBase can also be defined in layout.tsx for consistent absolute URLs
};

export default function BlogPage() {
  // Blog schema for better SEO
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${canonical}#blog`,
    name: 'Toasted Insights: Mental Health & Healing Blog',
    description: 'Mental health articles, therapy reflections, and self-care guides from licensed therapists',
    url: canonical,
    publisher: {
      '@type': 'Organization',
      name: 'Toasted Sesame Therapy',
      url: 'https://toastedsesametherapy.com',
      logo: 'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO-WHITE.svg'
    },
    author: {
      '@type': 'Person',
      name: 'Kay',
      jobTitle: 'Licensed Professional Counselor',
      worksFor: {
        '@type': 'Organization',
        name: 'Toasted Sesame Therapy'
      }
    },
    about: [
      'Mental Health',
      'Trauma Recovery',
      'Therapy',
      'Self-Care',
      'Anxiety Management',
      'Relationship Health',
      'Neurodiversity',
      'LGBTQIA+ Mental Health'
    ],
    keywords: 'mental health, therapy, trauma recovery, self-care, anxiety, relationships, neurodiversity, LGBTQ mental health',
    inLanguage: 'en-US',
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Toasted Sesame Therapy'
    }
  };

  return (
    <>
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogPageClient />
    </>
  );
}
