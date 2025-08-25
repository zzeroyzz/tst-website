import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock LogoOnly component
jest.mock('@/components/LogoOnly/LogoOnly', () => {
  return () => <div data-testid="logo-only">Logo Only</div>;
});

import ConditionalLayout from './ConditionalLayout';

describe('ConditionalLayout', () => {
  const mockChildren = [
    <nav key="nav" data-testid="nav">Navigation</nav>,
    <main key="main" data-testid="main">Main Content</main>,
    <footer key="footer" data-testid="footer">Footer</footer>
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows all components on regular pages', () => {
    mockUsePathname.mockReturnValue('/');
    
    const { getByTestId } = render(
      <ConditionalLayout>{mockChildren}</ConditionalLayout>
    );
    
    expect(getByTestId('nav')).toBeInTheDocument();
    expect(getByTestId('main')).toBeInTheDocument();
    expect(getByTestId('footer')).toBeInTheDocument();
  });

  it('shows logo + main + footer on booking pages', () => {
    mockUsePathname.mockReturnValue('/book/trauma');
    
    const { getByTestId, queryByTestId } = render(
      <ConditionalLayout>{mockChildren}</ConditionalLayout>
    );
    
    expect(getByTestId('logo-only')).toBeInTheDocument();
    expect(getByTestId('main')).toBeInTheDocument();
    expect(getByTestId('footer')).toBeInTheDocument();
    expect(queryByTestId('nav')).not.toBeInTheDocument();
  });

  it('shows only main content on dashboard pages', () => {
    mockUsePathname.mockReturnValue('/dashboard/something');
    
    const { getByTestId, queryByTestId } = render(
      <ConditionalLayout>{mockChildren}</ConditionalLayout>
    );
    
    expect(getByTestId('main')).toBeInTheDocument();
    expect(queryByTestId('nav')).not.toBeInTheDocument();
    expect(queryByTestId('footer')).not.toBeInTheDocument();
    expect(queryByTestId('logo-only')).not.toBeInTheDocument();
  });

  it('shows only main content on questionnaire pages', () => {
    mockUsePathname.mockReturnValue('/questionnaire/test');
    
    const { getByTestId, queryByTestId } = render(
      <ConditionalLayout>{mockChildren}</ConditionalLayout>
    );
    
    expect(getByTestId('main')).toBeInTheDocument();
    expect(queryByTestId('nav')).not.toBeInTheDocument();
    expect(queryByTestId('footer')).not.toBeInTheDocument();
    expect(queryByTestId('logo-only')).not.toBeInTheDocument();
  });

  it('shows only main content on cancellation pages', () => {
    mockUsePathname.mockReturnValue('/cancel-appointment/123');
    
    const { getByTestId, queryByTestId } = render(
      <ConditionalLayout>{mockChildren}</ConditionalLayout>
    );
    
    expect(getByTestId('main')).toBeInTheDocument();
    expect(queryByTestId('nav')).not.toBeInTheDocument();
    expect(queryByTestId('footer')).not.toBeInTheDocument();
    expect(queryByTestId('logo-only')).not.toBeInTheDocument();
  });
});