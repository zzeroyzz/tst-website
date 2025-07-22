// app/not-found.tsx
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tst-cream">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <Image
            src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/404%20Page%2001%20Artboard%201.svg"
            alt="404 - Page not found illustration"
            width={600}
            height={400}
            className="mx-auto"
            priority
          />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-black text-black mb-4">404</h1>
          <h2 className="text-3xl font-bold text-black mb-6">
            Oops! This page seems to have wandered off
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Don&apos;t worry—even the most organized among us lose track of things sometimes.
            Let&apos;s get you back to somewhere more familiar and supportive.
          </p>
        </div>
      </div>
    </div>
  );
}
