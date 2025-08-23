// src/app/book/nd/details/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import BookingDetailsPage from '@/components/TwoStepBooking/BookingDetailsPage';

export const metadata: Metadata = {
  title: 'Complete Your Neurodivergent-Friendly Session Booking | Kay Therapy',
  description:
    'Complete your booking for a neurodivergent-friendly free grounding plan session designed for your brain.',
  robots: {
    index: false, // Don't index details pages
    follow: false,
  },
};

export default function NDBookingDetailsPageRoute() {
  return (
    <Section className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <BookingDetailsPage variant="nd" />
      </div>
    </Section>
  );
}