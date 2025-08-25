// src/app/contact/page.tsx
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

const canonical = 'https://toastedsesametherapy.com/contact';

export const metadata: Metadata = {
  title: 'Contact a Queer Asian Therapist in Atlanta | Book a Consultation',
  description:
    'Ready to start? Contact Kay, a queer Korean American therapist in Atlanta. Book a no-pressure 15-minute consultation. Virtual therapy across Georgia.',
  alternates: { canonical },
  openGraph: {
    url: canonical,
    title: 'Contact a Queer Asian Therapist in Atlanta | Book a Consultation',
    description:
      'Reach out to Kay for a free 15-minute consult. Identity-centered, trauma-informed therapy in Atlanta and across Georgia via telehealth.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact a Queer Asian Therapist in Atlanta | Book a Consultation',
    description:
      'Book a 15-minute consult with Kay. Identity-centered, trauma-informed therapy for queer, Asian, and neurodivergent clients in Georgia.',
  },
};

// Redirect to booking page
export default function ContactPage() {
  redirect('/book/trauma');
}
