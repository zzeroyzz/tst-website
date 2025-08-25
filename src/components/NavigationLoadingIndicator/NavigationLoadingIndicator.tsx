'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';
import LoadingIndicator from '@/components/LoadingIndicator/LoadingIndicator';

const NavigationLoadingIndicator: React.FC = () => {
  const { isNavigating, setIsNavigating } = useNavigation();
  const pathname = usePathname();

  // Hide loading indicator when pathname changes (navigation complete)
  useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [pathname, isNavigating, setIsNavigating]);

  if (!isNavigating) {
    return null;
  }

  return <LoadingIndicator />;
};

export default NavigationLoadingIndicator;