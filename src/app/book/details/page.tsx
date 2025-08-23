// src/app/book/details/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import BookingDetailsPage from '@/components/TwoStepBooking/BookingDetailsPage';

export const metadata: Metadata = {
  title: 'Complete Your Free Grounding Session Booking | Kay Therapy',
  description:
    'Complete your booking for a free 15-minute grounding plan session with a licensed therapist in Georgia.',
  robots: {
    index: false, // Don't index details pages
    follow: false,
  },
};

export default function BookingDetailsPageRoute() {
  return (
    <Section className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <BookingDetailsPage variant="trauma" />
      </div>
    </Section>
  );
}