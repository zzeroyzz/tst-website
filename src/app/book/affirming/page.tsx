// src/app/book/affirming/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import UnifiedBookingFlow from '@/components/TwoStepBooking/UnifiedBookingFlow';
import AdditionalContent from '../AdditionalContent';

export const metadata: Metadata = {
  title: 'LGBTQIA-Affirming Free Grounding Plan Session | Kay Therapy',
  description:
    'Free 15-minute grounding plan session in a safe, LGBTQIA-affirming space. Mental health strategies that honor your identity. Licensed therapist in Georgia.',
  keywords: [
    'LGBTQIA therapy',
    'queer therapy',
    'trans therapy',
    'gay therapy',
    'lesbian therapy',
    'bisexual therapy',
    'non-binary therapy',
    'gender-affirming therapy',
    'Atlanta LGBTQ therapist',
    'Georgia queer therapy',
    'affirming mental health',
    'free consultation',
  ],
  openGraph: {
    title: 'LGBTQIA-Affirming Free Grounding Plan Session',
    description:
      'A safe space where your identity is celebrated. Free 15-minute session with Georgia-licensed, LGBTQIA-affirming therapist.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/book/affirming',
  },
};

export default function AffirmingBookingPage() {
  return (
    <div>
      <Section className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <UnifiedBookingFlow variant="affirming" />
        </div>
      </Section>
      
      {/* Additional content below the fold */}
      <AdditionalContent />
    </div>
  );
}
