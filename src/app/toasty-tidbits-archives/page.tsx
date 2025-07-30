// src/app/toasty-tidbits-archives/page.tsx
import type { Metadata } from 'next';
import ToastyTidbitsArchivePageClient from '@/components/clients/ToastyTidbitsArchivePageClient/ToastyTidbitsArchivePageClient';

// This is a Server Component, so we can correctly export metadata
export const metadata: Metadata = {
  title: 'Toasty Tidbits Archives | Toasted Sesame Therapy',
  description: 'Browse the archives of the Toasty Tidbits newsletter. Explore past publications with reflections, practical tips, and resources for your healing journey.'
};

// This page now just imports and renders the client part.
export default function ToastyTidbitsArchivesPage() {
  return <ToastyTidbitsArchivePageClient />;
}
