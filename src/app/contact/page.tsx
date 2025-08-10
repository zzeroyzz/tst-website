// src/app/contact/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import ContactPageClient from '@/components/clients/ContactPageClient/ContactPageClient';
import { faqData } from '@/data/faqData';

const canonical = 'https://toastedsesametherapy.com/contact';

export const metadata: Metadata = {
  title: 'Contact a Queer Asian Therapist in Atlanta | Book a Consultation',
  description:
    'Ready to start? Contact Kay, a queer Korean American therapist in Atlanta. Book a no-pressure 15-minute consultation. Virtual therapy across Georgia.',
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'Contact a Queer Asian Therapist in Atlanta | Book a Consultation',
    description:
      'Reach out to Kay for a free 15-minute consult. Identity-centered, trauma-informed therapy in Atlanta and across Georgia via telehealth.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact a Queer Asian Therapist in Atlanta | Book a Consultation',
    description:
      'Book a 15-minute consult with Kay. Identity-centered, trauma-informed therapy for queer, Asian, and neurodivergent clients in Georgia.'
  }
};

export default function ContactPage() {
  const faqSchema = {
    '@type': 'FAQPage',
    mainEntity: faqData.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.replace(/<[^>]*>?/gm, ' ')
      }
    }))
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toastedsesametherapy.com/' },
          { '@type': 'ListItem', position: 2, name: 'Contact', item: canonical }
        ]
      },
      {
        '@type': 'ContactPage',
        name: 'Contact — Book a Consultation',
        url: canonical,
        about: {
          '@type': 'Person',
          name: 'Kay'
        }
      },
      {
        '@type': 'Organization',
        name: 'Toasted Sesame Therapy',
        url: 'https://toastedsesametherapy.com/',
        contactPoint: [{
          '@type': 'ContactPoint',
          contactType: 'customer support',
          areaServed: 'US-GA',
          availableLanguage: ['English']
        }]
      },
      {
        '@type': 'Service',
        name: 'Trauma-Informed Psychotherapy',
        serviceType: 'Psychotherapy',
        provider: { '@type': 'Organization', name: 'Toasted Sesame Therapy' },
        areaServed: 'Georgia',
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: 'https://toastedsesametherapy.com/therapy-services'
        }
      },
      faqSchema
    ]
  };

  return (
    <>
      <Script id="contact-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ContactPageClient />
    </>
  );
}
