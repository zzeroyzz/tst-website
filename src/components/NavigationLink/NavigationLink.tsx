'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  children,
  className,
  id,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsNavigating } = useNavigation();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't show loading if we're already on this page
    if (pathname === href) {
      return;
    }

    e.preventDefault();
    setIsNavigating(true);

    try {
      router.push(href);
      
      // Set a timeout to hide loading after a reasonable time
      // in case the navigation doesn't trigger the layout effect
      setTimeout(() => {
        setIsNavigating(false);
      }, 3000);
    } catch (error) {
      setIsNavigating(false);
      console.error('Navigation error:', error);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      id={id}
    >
      {children}
    </Link>
  );
};

export default NavigationLink;