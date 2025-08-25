// src/app/therapy-services/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import ServicesPageClient from '@/components/clients/ServicesPageClient/ServicesPageClient';
import { faqData } from '@/data/faqData';
import { ourApproachData } from '@/data/servicesPageData';

const canonical = 'https://toastedsesametherapy.com/therapy-services';

export const metadata: Metadata = {
  title: 'Therapy Services in Atlanta, GA | Trauma-Informed & LGBTQIA+ Affirming',
  description:
    'Comprehensive therapy services in Atlanta and across Georgia. Specializing in trauma therapy, LGBTQIA+ affirming care, neurodivergent support, and Asian American mental health. Virtual sessions available statewide.',
  keywords: [
    'therapy services Atlanta',
    'trauma therapy Georgia', 
    'LGBTQIA+ therapy Atlanta',
    'neurodivergent therapy services',
    'Asian American therapy Atlanta',
    'complex trauma therapy',
    'virtual therapy Georgia',
    'individual therapy Atlanta',
    'affirming therapy services',
    'identity-centered therapy'
  ].join(', '),
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'Therapy Services in Atlanta, GA | Trauma-Informed & LGBTQIA+ Affirming',
    description:
      'Comprehensive trauma-informed, identity-centered therapy services for adults in Atlanta and across Georgia via telehealth.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Therapy Services in Atlanta, GA | Trauma-Informed Care',
    description:
      'Trauma-informed, LGBTQIA+ affirming therapy services for adults in Atlanta and across Georgia.',
  },
  robots: {
    index: true,
    follow: true,
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
