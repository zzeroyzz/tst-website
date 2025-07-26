// src/app/contact/page.tsx
import type { Metadata } from 'next';
import ContactPageClient from '@/components/ContactPageClient'; // Import the new client component

// This is a Server Component, so we can export metadata
export const metadata: Metadata = {
  title: 'Contact & Book a Consultation | Toasted Sesame Therapy',
  description: 'Ready to start? Reach out to book a free, no-pressure 15-minute consultation. Your journey toward healing is one conversation away.'
};

// This is the actual page component now. It just renders the client part.
export default function ContactPage() {
  return <ContactPageClient />;
}
