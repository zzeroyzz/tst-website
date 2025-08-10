// src/app/page.tsx (SERVER COMPONENT)
import type { Metadata } from 'next';
import Script from 'next/script';
import HomePageClient from '@/components/clients/HomePageClient/HomePageClient';

const canonical = 'https://toastedsesametherapy.com/';

export const metadata: Metadata = {
  metadataBase: new URL('https://toastedsesametherapy.com'),
  title: 'Therapy That Fits You, As You Are | Toasted Sesame Therapy',
  description:
    'Identity-centered, trauma-informed therapy for adults. Atlanta-based with virtual care across Georgia. Queer- and Asian-owned practice led by Kay (she/they).',
  alternates: { canonical },
  openGraph: {
    url: canonical,
    siteName: 'Toasted Sesame Therapy',
    title: 'Therapy That Fits You, As You Are',
    description:
      'Identity-centered, trauma-informed therapy for adults in Atlanta and across Georgia via telehealth.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Therapy That Fits You, As You Are',
    description:
      'Trauma‑informed, identity‑centered therapy for adults in Atlanta & across Georgia.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Toasted Sesame Therapy',
        url: canonical,
        sameAs: [
          // add socials if you want them recognized
          'https://www.instagram.com/toastedsesametherapy'
        ],
      },
      {
        '@type': 'WebSite',
        name: 'Toasted Sesame Therapy',
        url: canonical,
      },
      {
        '@type': 'WebPage',
        '@id': canonical + '#home',
        url: canonical,
        name: 'Therapy That Fits You, As You Are',
        isPartOf: { '@id': canonical },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: canonical },
        ],
      },
    ],
  };

  return (
    <>
      <Script id="home-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomePageClient />
    </>
  );
}
