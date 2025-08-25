'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LogoOnly: React.FC = () => {
  return (
    <nav className="w-full bg-tst-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start py-4">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/TST-LOGO.png"
              alt="TST logo"
              width={200}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LogoOnly;