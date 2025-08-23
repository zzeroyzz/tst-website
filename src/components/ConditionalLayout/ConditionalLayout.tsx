'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import LogoOnly from '@/components/LogoOnly/LogoOnly';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check page types
  const isQuestionnairePage = pathname?.startsWith('/questionnaire/');
  const isCancellationPage = pathname?.startsWith('/cancel-appointment/');
  const isDashboard = pathname?.startsWith('/dashboard');
  const isBookingPage = pathname?.startsWith('/book/');
  
  // For booking pages, show logo + main content only
  if (isBookingPage) {
    const childrenArray = Array.isArray(children) ? children : [children];
    return (
      <>
        <LogoOnly />
        {childrenArray[1]}
      </>
    );
  }

  // For other special pages, only render main content (no nav/footer)
  if (isQuestionnairePage || isCancellationPage || isDashboard) {
    const childrenArray = Array.isArray(children) ? children : [children];
    return <>{childrenArray[1]}</>;
  }

  // For all other pages, render everything normally
  return <>{children}</>;
}
