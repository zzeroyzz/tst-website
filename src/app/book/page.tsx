// src/app/book/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import UnifiedBookingFlow from '@/components/TwoStepBooking/UnifiedBookingFlow';
import AdditionalContent from './AdditionalContent';

export const metadata: Metadata = {
  title: 'Free Grounding Plan Session | Kay Therapy',
  description:
    'Free 15-minute grounding plan session with a licensed therapist in Georgia. Get personalized coping strategies that work for you.',
  keywords: [
    'therapy',
    'free consultation',
    'grounding techniques',
    'coping strategies',
    'mental health',
    'Atlanta therapist',
    'Georgia therapy',
    'stress management',
  ],
  openGraph: {
    title: 'Free Grounding Plan Session',
    description:
      'Get personalized coping strategies in a free 15-minute session with a Georgia-licensed therapist.',
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