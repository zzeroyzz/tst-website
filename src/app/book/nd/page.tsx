// src/app/book/nd/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import UnifiedBookingFlow from '@/components/TwoStepBooking/UnifiedBookingFlow';
import AdditionalContent from '../AdditionalContent';

export const metadata: Metadata = {
  title: 'Neurodivergent-Friendly Free Grounding Plan Session | Kay Therapy',
  description:
    'Free 15-minute grounding plan session designed specifically for neurodivergent adults. Get practical, sensory-aware coping strategies that work with your brain. Licensed therapist in Georgia.',
  keywords: [
    'neurodivergent therapy',
    'ADHD coping strategies',
    'autism therapy',
    'sensory-friendly therapy',
    'neurodivergent-affirming',
    'executive functioning support',
    'stimming-friendly therapy',
    'Atlanta neurodivergent therapist',
    'Georgia ADHD therapy',
    'free consultation',
  ],
  openGraph: {
    title: 'Neurodivergent-Friendly Free Grounding Plan Session',
    description:
      'Practical, sensory-aware coping strategies designed for neurodivergent brains. Free 15-minute session with Georgia-licensed therapist.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/book/nd',
  },
};

export default function NeurodivergentBookingPage() {
  return (
    <div>
      <Section className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <UnifiedBookingFlow variant="nd" />
        </div>
      </Section>
      
      {/* Additional content below the fold */}
      <AdditionalContent />
    </div>
  );
}
