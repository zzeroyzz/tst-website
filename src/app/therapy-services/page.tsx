// src/app/therapy-services/page.tsx
import type { Metadata } from 'next';
import ServicesPageClient from '@/components/ServicesPageClient';

export const metadata: Metadata = {
  title: 'Therapy Services | Toasted Sesame Therapy',
  description: 'Explore our neuro-affirming, trauma-informed, and somatic therapy services. Personalized online therapy that fits you, as you are.'
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
