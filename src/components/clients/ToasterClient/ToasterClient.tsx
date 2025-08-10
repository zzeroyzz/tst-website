// src/components/ToasterClient.tsx
'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterClient() {
  return <Toaster position="top-center" reverseOrder={false} />;
}
