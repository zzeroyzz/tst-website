// src/app/about/page.tsx
import type { Metadata } from 'next';
import AboutPageClient from '@/components/AboutPageClient';

export const metadata: Metadata = {
  title: 'About Kay | Toasted Sesame Therapy',
  description: 'Meet Kay (she/they), a Korean American, queer, and neurodivergent therapist dedicated to providing identity-centered care.'
};

export default function AboutPage() {
  return <AboutPageClient />;
}
