// src/app/book/page.tsx - Redirect to trauma variant
import { redirect } from 'next/navigation';

export default function BookingPage() {
  redirect('/book/trauma');
}
