// src/app/book/affirming/details/page.tsx
import { Metadata } from 'next';
import Section from '@/components/Section/Section';
import BookingDetailsPage from '@/components/TwoStepBooking/BookingDetailsPage';

export const metadata: Metadata = {
  title: 'Complete Your LGBTQIA-Affirming Session Booking | Kay Therapy',
  description:
    'Complete your booking for an LGBTQIA-affirming free grounding plan session in a safe, celebrating space.',
  robots: {
    index: false, // Don't index details pages
    follow: false,
  },
};

export default function AffirmingBookingDetailsPageRoute() {
  return (
    <Section className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <BookingDetailsPage variant="affirming" />
      </div>
    </Section>
  );
}