// src/app/book/trauma/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import UnifiedBookingFlow from '@/components/TwoStepBooking/UnifiedBookingFlow';
import AdditionalContent from '../AdditionalContent';

export const metadata: Metadata = {
  title: 'Free Consultation + Fit-or-Free Sessions for Georgia Adults | Kay Therapy',
  description:
    'Free 15-minute consultation with trauma-informed approaches. If your first session isn\'t a good fit, it\'s completely free. Feel safe and grounded even when life feels overwhelming. Licensed therapist in Georgia.',
  keywords: [
    'trauma therapy',
    'trauma-informed therapy',
    'PTSD therapy',
    'anxiety therapy',
    'grounding techniques',
    'coping strategies',
    'emotional regulation',
    'Atlanta trauma therapist',
    'Georgia trauma therapy',
    'stress management',
    'free consultation',
  ],
  openGraph: {
    title: 'Free Consultation + Fit-or-Free Sessions for Georgia Adults',
    description:
      'Trauma-informed strategies to help you feel safe when life feels overwhelming. Free 15-minute consultation plus fit-or-free therapy sessions.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/book/trauma',
  },
};

export default function TraumaBookingPage() {
  return (
    <div>
      <Section className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <UnifiedBookingFlow variant="trauma" />
        </div>
      </Section>

      {/* Additional content below the fold */}
      <AdditionalContent variant="trauma" pageUrl="/book/trauma" />
    </div>
  );
}
