import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock next/link and next/image
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  );
});

// Mock HoverLink component
jest.mock('@/components/HoverLink/HoverLink', () => {
  return ({ children, href, className }: any) => (
    <a href={href} className={className}>{children}</a>
  );
});

// Mock CookieSettings component
jest.mock('@/components/CookieSettings/CookieSettings', () => {
  return () => <div>Cookie Settings</div>;
});

import Footer from './Footer';

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows quick links on non-booking pages', () => {
    mockUsePathname.mockReturnValue('/');
    
    const { getByText } = render(<Footer />);
    
    expect(getByText('Quick Links')).toBeInTheDocument();
    expect(getByText('Therapy Services')).toBeInTheDocument();
    expect(getByText('About Kay')).toBeInTheDocument();
  });

  it('hides quick links on booking pages', () => {
    mockUsePathname.mockReturnValue('/book/some-service');
    
    const { queryByText } = render(<Footer />);
    
    expect(queryByText('Quick Links')).not.toBeInTheDocument();
    expect(queryByText('Therapy Services')).not.toBeInTheDocument();
    expect(queryByText('About Kay')).not.toBeInTheDocument();
  });

  it('always shows legal section regardless of page', () => {
    mockUsePathname.mockReturnValue('/book/test');
    
    const { getByText } = render(<Footer />);
    
    expect(getByText('Legal')).toBeInTheDocument();
    expect(getByText('Privacy Policy')).toBeInTheDocument();
    expect(getByText('Practice Policy')).toBeInTheDocument();
  });

  it('adjusts grid columns based on booking page status', () => {
    const { container, rerender } = render(<Footer />);
    
    // Mock non-booking page
    mockUsePathname.mockReturnValue('/');
    rerender(<Footer />);
    let gridElement = container.querySelector('.grid');
    expect(gridElement).toHaveClass('md:grid-cols-4');
    
    // Mock booking page
    mockUsePathname.mockReturnValue('/book/test');
    rerender(<Footer />);
    gridElement = container.querySelector('.grid');
    expect(gridElement).toHaveClass('md:grid-cols-3');
  });
});