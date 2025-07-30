// src/app/contact/page.tsx
import type { Metadata } from 'next';
import ContactPageClient from '@/components/Contact/ContactPageClient';
import { faqData } from '@/data/faqData'; // Import the FAQ data

export const metadata: Metadata = {
  title: 'Contact & Book a Consultation | Toasted Sesame Therapy',
  description: 'Ready to start? Reach out to book a free, no-pressure 15-minute consultation. Your journey toward healing is one conversation away.'
};

export default function ContactPage() {
  // Generate the JSON for the schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        // This removes any HTML like <br /> for the schema script
        "text": item.answer.replace(/<[^>]*>?/gm, ' ')
      }
    }))
  };

  return (
    <>
      {/* Add the schema script here */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Render the client component */}
      <ContactPageClient />
    </>
  );
}
