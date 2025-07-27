// src/app/guides/page.tsx
import type { Metadata } from 'next';
import GuidesPageClient from '@/components/GuidesPageClient'; // Import the new client component

// This is a Server Component, so we can export metadata
export const metadata: Metadata = {
  title: 'Get 3 Free Therapy Guides | Toasted Sesame Therapy',
  description: 'Access 3 free, powerful guides on communication, self-regulation, and confidence. Subscribe to our newsletter to get your free therapy tools.'
};

// This is the actual page component now. It just renders the client part.
export default function GuidesPage() {
  return <GuidesPageClient />;
}
