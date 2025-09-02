// src/app/therapy-services/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import ServicesPageClient from '@/components/clients/ServicesPageClient/ServicesPageClient';
import { faqData } from '@/data/faqData';
import { ourApproachData } from '@/data/servicesPageData';

const canonical = 'https://toastedsesametherapy.com/therapy-services';

export const metadata: Metadata = {
  title: 'Our Therapy Services | Trauma-Informed & Neurodivergent-Affirming Care in Georgia',
  description:
    'Our comprehensive virtual therapy services across Georgia specialize in trauma therapy, LGBTQIA+ affirming care, neurodivergent support, and identity-centered mental health. Licensed therapist offering secure telehealth sessions.',
  keywords: [
    'therapy services Georgia',
    'trauma therapy virtual',
    'LGBTQIA+ therapy telehealth',
    'neurodivergent therapy services',
    'identity-centered therapy',
    'complex trauma therapy',
    'virtual therapy Georgia',
    'individual therapy telehealth',
    'affirming therapy services',
    'CPTSD therapy Georgia',
    'autism therapy support',
    'ADHD therapy services'
  ].join(', '),
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'Our Therapy Services | Trauma-Informed & Neurodivergent-Affirming Care',
    description:
      'Our comprehensive trauma-informed, identity-centered therapy services for adults across Georgia via secure telehealth. Specializing in neurodivergent, LGBTQIA+, and BIPOC affirming care.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Therapy Services | Trauma-Informed & Neurodivergent-Affirming Care',
    description:
      'Our trauma-informed, LGBTQIA+ and neurodivergent-affirming therapy services for adults across Georgia via secure telehealth.',
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
