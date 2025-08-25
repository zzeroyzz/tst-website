// src/components/Breadcrumb/Breadcrumb.tsx
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Script from 'next/script';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Generate Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { 
        item: {
          '@type': 'WebPage',
          '@id': `https://toastedsesametherapy.com${item.href}`
        }
      })
    }))
  };

  return (
    <>
      {/* Breadcrumb Schema */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      
      <nav 
        className={`flex items-center space-x-1 text-sm ${className}`}
        aria-label="Breadcrumb navigation"
      >
        <ol className="flex items-center space-x-1" role="list">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="w-4 h-4 text-gray-400 mx-1" 
                  aria-hidden="true"
                />
              )}
              
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                  aria-current={index === items.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className="text-gray-500 font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}