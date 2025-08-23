// src/app/book/trauma/details/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import BookingDetailsPage from '@/components/TwoStepBooking/BookingDetailsPage';

export const metadata: Metadata = {
  title: 'Complete Your Trauma-Informed Session Booking | Kay Therapy',
  description:
    'Complete your booking for a trauma-informed free grounding plan session designed to help you feel safe.',
  robots: {
    index: false, // Don't index details pages
    follow: false,
  },
};

export default function TraumaBookingDetailsPageRoute() {
  return (
    <Section className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <BookingDetailsPage variant="trauma" />
      </div>
    </Section>
  );
}