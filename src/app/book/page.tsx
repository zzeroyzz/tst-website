// src/app/book/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import UnifiedBookingFlow from '@/components/TwoStepBooking/UnifiedBookingFlow';
import AdditionalContent from './AdditionalContent';

export const metadata: Metadata = {
  title: 'Free 15-Minute Consultation + Fit-or-Free Sessions | Kay Therapy',
  description:
    'Free 15-minute consultation with a licensed therapist in Georgia. After your consultation, book fit-or-free therapy sessions - if they\'re not a good fit, they\'re completely free. Get personalized coping strategies that work for you.',
  keywords: [
    'therapy',
    'free consultation',
    'fit-or-free session',
    'risk-free therapy',
    'coping strategies',
    'mental health',
    'Atlanta therapist',
    'Georgia therapy',
    'stress management',
  ],
  openGraph: {
    title: 'Free 15-Minute Consultation + Fit-or-Free Sessions',
    description:
      'Free 15-minute consultation plus fit-or-free therapy sessions with a Georgia-licensed therapist. If therapy sessions aren\'t a good fit, they\'re completely free.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/book',
  },
};

export default function BookingPage() {
  return (
    <div>
      <Section className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <UnifiedBookingFlow variant="trauma" />
        </div>
      </Section>

      {/* Additional content below the fold */}
      <AdditionalContent />
    </div>
  );
}
