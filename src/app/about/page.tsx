// src/app/about/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import AboutPageClient from '@/components/clients/AboutPageClient/AboutPageClient';

const canonical = 'https://toastedsesametherapy.com/about';

export const metadata: Metadata = {
  title: 'Queer Asian Therapist in Atlanta | About Kay',
  description:
    'Kay (she/they) is a queer Korean American therapist in Atlanta providing trauma‑informed, identity‑centered therapy. Virtual sessions across Georgia.',
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'Queer Asian Therapist in Atlanta | About Kay',
    description:
      'Identity‑centered, trauma‑informed therapy for queer, Asian, and neurodivergent clients. Based in Atlanta. Georgia telehealth available.',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Queer Asian Therapist in Atlanta | About Kay',
    description:
      'Trauma‑informed, identity‑centered therapy for queer, Asian, and neurodivergent clients in Atlanta and across Georgia.',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name: 'Kay',
        jobTitle: 'Licensed Professional Counselor',
        image:
          'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/MYT-v3.png',
        url: canonical,
        worksFor: {
          '@type': 'Organization',
          name: 'Toasted Sesame Therapy',
          url: 'https://toastedsesametherapy.com/',
        },
        knowsAbout: [
          'Complex trauma',
          'C-PTSD',
          'Neurodivergence',
          'LGBTQ+ affirming therapy',
          'Asian American mental health',
        ],
        areaServed: {
          '@type': 'City',
          name: 'Atlanta',
          address: {
            '@type': 'PostalAddress',
            addressRegion: 'GA',
            addressCountry: 'US',
          },
        },
      },
      {
        '@type': 'Service',
        name: 'Trauma-Informed Psychotherapy',
        provider: { '@type': 'Organization', name: 'Toasted Sesame Therapy' },
        serviceType: 'Psychotherapy',
        areaServed: 'Georgia',
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: 'https://toastedsesametherapy.com/therapy-services',
          availableLanguage: ['English'],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Do you work with queer Asian clients in Atlanta?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. I specialize in identity-centered care for queer and Asian clients in Atlanta with virtual sessions available across Georgia.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do you offer virtual therapy across Georgia?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. All sessions are held virtually for clients located anywhere in Georgia.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutPageClient />
    </>
  );
}
