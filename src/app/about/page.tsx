// src/app/about/page.tsx
import type { Metadata } from 'next';
import AboutPageClient from '@/components/About/AboutPageClient';

export const metadata: Metadata = {
  title: 'About Kay | Toasted Sesame Therapy',
  description: 'Meet Kay (she/they), a Korean American, queer, and neurodivergent therapist dedicated to providing identity-centered care.'
};

export default function AboutPage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Kay",
    "jobTitle": "Licensed Professional Counselor",
    "image": "https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/MYT-v2.png",
    "url": "https://toastedsesametherapy.com/about",
    "sameAs": [
      // Add links to social media profiles if available
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "Toasted Sesame Therapy"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <AboutPageClient />
    </>
  );
}
