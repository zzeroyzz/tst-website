// src/app/about/page.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import AboutPageClient from '@/components/clients/AboutPageClient/AboutPageClient';

const canonical = 'https://toastedsesametherapy.com/about';

export const metadata: Metadata = {
  title: 'About Kay - Licensed Therapist in Atlanta, GA | Trauma-Informed Care',
  description:
    'Meet Kay, LPC - Licensed Professional Counselor specializing in trauma-informed, LGBTQIA+-affirming therapy for adults in Georgia. Korean American therapist providing virtual sessions statewide.',
  keywords: [
    'Kay therapist',
    'licensed professional counselor Atlanta',
    'Korean American therapist',
    'queer therapist Atlanta',
    'trauma-informed therapist Georgia',
    'LGBTQIA+ affirming therapist',
    'Asian American mental health',
    'neurodivergent therapist Atlanta',
    'virtual therapy Georgia',
    'LPC013996 Georgia'
  ].join(', '),
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'About Kay - Licensed Therapist in Atlanta, GA | Trauma-Informed Care',
    description:
      'Meet Kay, LPC - Korean American therapist providing LGBTQIA+-affirming, trauma-informed therapy for adults across Georgia via telehealth.',
    type: 'profile',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Kay - Licensed Therapist in Atlanta, GA',
    description:
      'Korean American therapist specializing in trauma-informed, LGBTQIA+-affirming therapy for adults in Georgia.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://toastedsesametherapy.com/about#kay',
        name: 'Kay',
        additionalName: 'Kahlor Lutz',
        jobTitle: 'Licensed Professional Counselor',
        description: 'Licensed Professional Counselor specializing in trauma-informed, LGBTQIA+-affirming therapy for adults in Georgia.',
        image: 'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/MYT-v3.png',
        url: canonical,
        email: 'care@toastedsesametherapy.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Atlanta',
          addressRegion: 'GA',
          addressCountry: 'US'
        },
        worksFor: {
          '@type': 'MedicalBusiness',
          name: 'Toasted Sesame Therapy',
          url: 'https://toastedsesametherapy.com/',
        },
        hasCredential: [
          {
            '@type': 'EducationalOccupationalCredential',
            name: 'Licensed Professional Counselor',
            credentialCategory: 'Professional License',
            recognizedBy: {
              '@type': 'Organization',
              name: 'Georgia Board of Professional Counselors'
            }
          },
          {
            '@type': 'EducationalOccupationalCredential',
            name: 'Master of Science in Clinical Mental Health Counseling',
            educationalLevel: 'Graduate',
            recognizedBy: {
              '@type': 'CollegeOrUniversity',
              name: 'Mercer University Atlanta'
            }
          },
          {
            '@type': 'EducationalOccupationalCredential',
            name: 'Integrative Somatic Trauma Therapy Training',
            educationalLevel: '60 hours',
            recognizedBy: {
              '@type': 'Organization',
              name: 'The Embody Lab'
            }
          }
        ],
        knowsAbout: [
          'Complex trauma',
          'C-PTSD',
          'Neurodivergent-affirming therapy',
          'LGBTQIA+ affirming therapy',
          'Korean American mental health',
          'Asian American mental health',
          'Integrative Somatic Trauma Therapy',
          'Gender-affirming therapy',
          'Highly sensitive person support',
          'Caregiver support',
          'Creative professional therapy'
        ],
        areaServed: {
          '@type': 'State',
          name: 'Georgia',
          containsPlace: {
            '@type': 'City',
            name: 'Atlanta'
          }
        },
        nationality: {
          '@type': 'Country',
          name: 'United States'
        },
        ethnicity: 'Korean American',
        gender: 'Non-binary (she/they)',
        performerIn: {
          '@type': 'Service',
          name: 'Individual Therapy Sessions'
        }
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
