// src/app/therapy-services/page.tsx
import type { Metadata } from 'next';
import ServicesPageClient from '@/components/ServicesPageClient';
import { faqData } from '@/data/faqData';
import { ourApproachData } from '@/data/servicesPageData';

export const metadata: Metadata = {
  title: 'Therapy Services | Toasted Sesame Therapy',
  description: 'Explore our neuro-affirming, trauma-informed, and somatic therapy services. Personalized online therapy that fits you, as you are.'
};

export default function ServicesPage() {
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

   const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Individual Therapy",
    "provider": {
      "@type": "MedicalBusiness",
      "name": "Toasted Sesame Therapy"
    },
    "description": "One-on-one support in a supportive space to help you feel less alone.",
    "areaServed": {
      "@type": "State",
      "name": "Georgia"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Therapy Approaches",
      "itemListElement": ourApproachData.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.title,
          "description": service.description
        }
      }))
    }
  };

  return (
    <>
      {/* Add the schema script here */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
<script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {/* Render the client component */}
      <ServicesPageClient />
    </>
  );
}
