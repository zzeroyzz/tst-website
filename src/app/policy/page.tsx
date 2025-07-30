// src/app/policy/page.tsx
import type { Metadata } from 'next';
import PolicyPageClient from '@/components/clients/PolicyPageClient/PolicyPageClient';

// The metadata is right here
export const metadata: Metadata = {
  title: 'Policies | Toasted Sesame Therapy',
  description: 'Read the Privacy Policy and Practice Policies for Toasted Sesame Therapy. Information on confidentiality, fees, and crisis resources.'
};

export default function PolicyPage() {
  return <PolicyPageClient />;
}
