import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/image
jest.mock('next/image', () => {
  return ({ src, alt }: any) => <img src={src} alt={alt} />;
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    h2: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
    p: ({ children, className }: any) => <p className={className}>{children}</p>,
  },
  useInView: () => true,
}));

// Mock components
jest.mock('@/components/Section/Section', () => {
  return ({ children, className }: any) => <div className={`section ${className || ''}`}>{children}</div>;
});

jest.mock('@/components/FAQ/FAQ', () => {
  return () => <div>FAQ Component</div>;
});

jest.mock('@/components/HowFitFreeWorksSteps/HowFitFreeWorksSteps', () => {
  return () => <div>HowFitFreeWorksSteps Component</div>;
});

jest.mock('@/components/ProfileImage/ProfileImage', () => {
  return () => <div>Profile Image</div>;
});

jest.mock('@/components/FocusAreaBanner/FocusAreaBanner', () => {
  return () => <div>Focus Area Banner</div>;
});

jest.mock('@/components/TestimonialCardBooking/TestimonialCardBooking', () => {
  return ({ quote }: any) => <div className="testimonial-card">{quote}</div>;
});

// Mock data
jest.mock('@/data/bookData', () => ({
  howFitFreeWorksSteps: [
    { number: '01', title: 'Step 1', description: 'Description 1', imageUrl: '/test.jpg', imageAlt: 'Alt 1', isLastStep: false }
  ],
  stepSection: { title: 'Steps Title', subtitle: 'Steps Subtitle' },
  meetYourTherapistBook: { 
    title: 'Meet Your Therapist', 
    paragraphs: ['Paragraph 1', 'Paragraph 2'] 
  },
}));

jest.mock('@/data/servicesPageData', () => ({
  therapyFocusAreas: ['Anxiety', 'Trauma'],
}));

jest.mock('@/data/pageData', () => ({
  testimonials: [
    { quote: 'Great service!', iconUrl: '/icon1.svg', bgColor: 'bg-blue-100', altText: 'Icon 1' },
    { quote: 'Amazing experience!', iconUrl: '/icon2.svg', bgColor: 'bg-green-100', altText: 'Icon 2' },
    { quote: 'Highly recommend!', iconUrl: '/icon3.svg', bgColor: 'bg-purple-100', altText: 'Icon 3' }
  ],
}));

import AdditionalContent from './AdditionalContent';

describe('AdditionalContent', () => {
  it('renders testimonials in horizontal layout', () => {
    const { container, getByText } = render(<AdditionalContent />);
    
    // Check that testimonials container has flex layout classes
    const testimonialsContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(testimonialsContainer).toBeInTheDocument();
    
    // Check that all testimonials are rendered
    const testimonialCards = container.querySelectorAll('.testimonial-card');
    expect(testimonialCards).toHaveLength(3);
    
    // Verify testimonial content
    expect(getByText('Great service!')).toBeInTheDocument();
    expect(getByText('Amazing experience!')).toBeInTheDocument();
    expect(getByText('Highly recommend!')).toBeInTheDocument();
  });

  it('applies correct flex classes for responsive layout', () => {
    const { container } = render(<AdditionalContent />);
    
    const testimonialsContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(testimonialsContainer).toHaveClass('gap-4', 'sm:gap-6', 'mt-8');
    
    // Check that each testimonial wrapper has flex-1 class
    const testimonialWrappers = container.querySelectorAll('.flex-1');
    expect(testimonialWrappers.length).toBeGreaterThanOrEqual(3);
  });

  it('includes focus area banner component', () => {
    const { getByText } = render(<AdditionalContent />);
    
    expect(getByText('Focus Area Banner')).toBeInTheDocument();
  });
});