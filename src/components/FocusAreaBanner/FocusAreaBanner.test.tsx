import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import FocusAreaBanner from './FocusAreaBanner';

const mockFocusAreas = [
  'Anxiety & Overwhelm',
  'Trauma & CPTSD',
  'Burnout & Exhaustion'
];

describe('FocusAreaBanner', () => {
  it('renders focus areas correctly', () => {
    const { getAllByText } = render(
      <FocusAreaBanner focusAreas={mockFocusAreas} />
    );

    // Should render multiple instances (3 sets) for seamless loop
    expect(getAllByText('Anxiety & Overwhelm')).toHaveLength(3);
    expect(getAllByText('Trauma & CPTSD')).toHaveLength(3);
    expect(getAllByText('Burnout & Exhaustion')).toHaveLength(3);
  });

  it('applies custom className', () => {
    const { container } = render(
      <FocusAreaBanner focusAreas={mockFocusAreas} className="test-class" />
    );

    expect(container.firstChild).toHaveClass('test-class');
  });

  it('renders multiple sets of focus areas for seamless loop', () => {
    const { container } = render(
      <FocusAreaBanner focusAreas={mockFocusAreas} />
    );

    // Should have multiple instances of each focus area for the seamless loop
    const anxietyElements = container.querySelectorAll('[class*="inline-block"]');
    expect(anxietyElements.length).toBeGreaterThan(mockFocusAreas.length);
  });
});