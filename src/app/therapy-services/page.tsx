// src/app/therapy-services/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import ServicesPageClient from '@/components/clients/ServicesPageClient/ServicesPageClient';
import { faqData } from '@/data/faqData';
import { ourApproachData } from '@/data/servicesPageData';

const canonical = 'https://toastedsesametherapy.com/therapy-services';

export const metadata: Metadata = {
  title:
    'Trauma Therapy in Atlanta | Queer Asian Therapist | Toasted Sesame Therapy',
  description:
    'Identity-centered, trauma-informed therapy in Atlanta and across Georgia via telehealth. Support for complex trauma, C-PTSD, queer and Asian clients, and neurodivergent folks.',
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'Trauma Therapy in Atlanta | Toasted Sesame Therapy',
    description:
      'Trauma-informed, identity-centered therapy for adults in Atlanta and across Georgia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trauma Therapy in Atlanta | Toasted Sesame Therapy',
    description:
      'Identity-centered, trauma-informed therapy for adults in Atlanta and across Georgia.',
  },
};

export default function ServicesPage() {
  const faqSchema = {
    '@type': 'FAQPage',
    mainEntity: faqData.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.replace(/<[^>]*>?/gm, ' '),
      },
    })),
  };

  const serviceSchema = {
    '@type': 'Service',
    name: 'Trauma-Informed Psychotherapy',
    serviceType: 'Psychotherapy',
    description:
      'One-on-one identity-centered, trauma-informed therapy for adults, including support for complex trauma and C-PTSD.',
    areaServed: ['Atlanta, GA', 'Georgia'],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: canonical,
      availableLanguage: ['English'],
    },
    provider: {
      '@type': 'Organization',
      name: 'Toasted Sesame Therapy',
      url: 'https://toastedsesametherapy.com/',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Therapy Approaches',
      itemListElement: ourApproachData.map(s => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: s.description,
        },
      })),
    },
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://toastedsesametherapy.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Therapy Services',
            item: canonical,
          },
        ],
      },
      {
        '@type': 'Organization',
        name: 'Toasted Sesame Therapy',
        url: 'https://toastedsesametherapy.com/',
      },
      serviceSchema,
      faqSchema,
    ],
  };

  return (
    <>
      <Script
        id="services-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesPageClient />
    </>
  );
}
