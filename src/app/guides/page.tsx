// src/app/guides/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import GuidesPageClient from '@/components/clients/GuidesPageClient/GuidesPageClient';

const canonical = 'https://toastedsesametherapy.com/guides';

export const metadata: Metadata = {
  title: 'Free Mental Health Guides & Resources | Therapy Tools for Self-Care',
  description:
    'Download free mental health guides from licensed therapists. Learn communication skills, emotional regulation techniques, and confidence-building strategies. Evidence-based therapy resources for Georgia residents.',
  keywords: [
    'free therapy guides',
    'mental health resources',
    'communication skills guide',
    'emotional regulation techniques',
    'confidence building exercises',
    'self-care resources',
    'therapy tools',
    'mental health education',
    'trauma recovery resources',
    'anxiety management techniques'
  ].join(', '),
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'Free Mental Health Guides & Resources | Therapy Tools for Self-Care',
    description:
      'Download evidence-based mental health guides from licensed therapists. Learn communication, emotional regulation, and confidence-building skills.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Mental Health Guides & Therapy Resources',
    description:
      'Evidence-based guides for communication, emotional regulation, and confidence-building from licensed therapists.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GuidesPage() {
  // Structured data for the resource guides
  const guidesSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: 'Free Mental Health Guides & Resources',
        description: 'Download free mental health guides from licensed therapists',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://toastedsesametherapy.com/'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Guides',
              item: canonical
            }
          ]
        }
      },
      {
        '@type': 'ItemList',
        name: 'Mental Health Resource Guides',
        description: 'Free downloadable guides for mental health and therapy skills',
        numberOfItems: 3,
        itemListElement: [
          {
            '@type': 'CreativeWork',
            '@id': `${canonical}#communication-guide`,
            name: 'Communication Skills Guide',
            description: 'Learn effective communication strategies for relationships and conflict resolution',
            author: {
              '@type': 'Person',
              name: 'Kay',
              jobTitle: 'Licensed Professional Counselor'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Toasted Sesame Therapy'
            },
            about: 'Communication skills, relationship improvement, conflict resolution'
          },
          {
            '@type': 'CreativeWork',
            '@id': `${canonical}#regulation-guide`,
            name: 'Emotional Self-Regulation Guide',
            description: 'Techniques for managing emotions, anxiety, and stress responses',
            author: {
              '@type': 'Person',
              name: 'Kay',
              jobTitle: 'Licensed Professional Counselor'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Toasted Sesame Therapy'
            },
            about: 'Emotional regulation, anxiety management, coping skills'
          },
          {
            '@type': 'CreativeWork',
            '@id': `${canonical}#confidence-guide`,
            name: 'Confidence Building Guide',
            description: 'Strategies for building self-esteem and overcoming self-doubt',
            author: {
              '@type': 'Person',
              name: 'Kay',
              jobTitle: 'Licensed Professional Counselor'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Toasted Sesame Therapy'
            },
            about: 'Self-confidence, self-esteem, personal development'
          }
        ]
      }
    ]
  };

  return (
    <>
      <Script
        id="guides-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guidesSchema) }}
      />
      <GuidesPageClient />
    </>
  );
}
