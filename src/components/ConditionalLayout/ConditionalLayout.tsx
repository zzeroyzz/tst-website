'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if we're on a questionnaire page
  const isQuestionnairePage = pathname?.startsWith('/questionnaire/');
    const isCancellationPage = pathname?.startsWith('/cancel-appointment/');

  if (isQuestionnairePage || isCancellationPage) {
    // For questionnaire pages, only render the main content (children[1])
    // children[0] = Nav, children[1] = main, children[2] = Footer
    const childrenArray = Array.isArray(children) ? children : [children];
    return <>{childrenArray[1]}</>;
  }

  // For all other pages, render everything normally
  return <>{children}</>;
}
