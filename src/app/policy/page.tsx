// src/app/policy/page.tsx
import type { Metadata } from 'next';
import PolicyPageClient from '@/components/clients/PolicyPageClient/PolicyPageClient';

const canonical = 'https://toastedsesametherapy.com/policy';

export const metadata: Metadata = {
  title: 'Privacy Policy & Practice Policies | Toasted Sesame Therapy',
  description:
    'Privacy Policy and Practice Policies for Toasted Sesame Therapy. Information on confidentiality, fees, insurance, and crisis resources for therapy clients in Georgia.',
  keywords: [
    'therapy privacy policy',
    'mental health confidentiality',
    'therapy practice policies',
    'Georgia therapy policies',
    'HIPAA compliance therapy',
    'therapy fees insurance',
    'crisis resources mental health',
    'therapy cancellation policy'
  ].join(', '),
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'Privacy Policy & Practice Policies | Toasted Sesame Therapy',
    description: 'Privacy Policy and Practice Policies for therapy services in Georgia.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PolicyPage() {
  return <PolicyPageClient />;
}
