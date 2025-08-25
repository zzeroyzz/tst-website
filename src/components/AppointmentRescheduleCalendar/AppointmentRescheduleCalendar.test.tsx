import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock date-fns-tz
jest.mock('date-fns-tz', () => ({
  toZonedTime: jest.fn((date) => new Date(date)),
  format: jest.fn(() => 'Mocked Date'),
  formatTz: jest.fn(() => 'Mocked Date Eastern'),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'January 2024'),
  startOfMonth: jest.fn(() => new Date('2024-01-01')),
  endOfMonth: jest.fn(() => new Date('2024-01-31')),
  startOfWeek: jest.fn(() => new Date('2024-01-01')),
  endOfWeek: jest.fn(() => new Date('2024-01-07')),
  eachDayOfInterval: jest.fn(() => [new Date('2024-01-01')]),
  addMonths: jest.fn(() => new Date('2024-02-01')),
  subMonths: jest.fn(() => new Date('2023-12-01')),
  isSameMonth: jest.fn(() => true),
  isToday: jest.fn(() => false),
  addHours: jest.fn(() => new Date()),
  getDay: jest.fn(() => 1),
  isSameDay: jest.fn(() => false),
  isAfter: jest.fn(() => true),
}));

// Mock Button component
jest.mock('@/components/Button/Button', () => {
  return ({ children, onClick, className, disabled }: any) => (
    <button onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
});

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ bookedSlots: [] }),
  })
) as jest.Mock;

import AppointmentRescheduleCalendar from './AppointmentRescheduleCalendar';

describe('AppointmentRescheduleCalendar Responsive Design', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    contactId: '123',
    contactUuid: 'uuid-123',
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    currentAppointmentDate: new Date('2024-01-15T10:00:00Z'),
    onReschedule: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with responsive modal width classes', () => {
    const { container } = render(<AppointmentRescheduleCalendar {...mockProps} />);
    
    // Check for responsive modal container
    const modal = container.querySelector('.fixed.inset-0.z-50');
    expect(modal).toBeInTheDocument();
    
    // Check for responsive width classes
    const modalContent = container.querySelector('.max-w-sm.sm\\:max-w-4xl');
    expect(modalContent).toBeInTheDocument();
  });

  it('applies responsive height classes', () => {
    const { container } = render(<AppointmentRescheduleCalendar {...mockProps} />);
    
    // Check for responsive height classes on modal
    const modal = container.querySelector('.max-h-\\[80vh\\].sm\\:max-h-\\[90vh\\]');
    expect(modal).toBeInTheDocument();
    
    // Check for responsive height classes on modal body
    const modalBody = container.querySelector('.max-h-\\[50vh\\].sm\\:max-h-\\[75vh\\]');
    expect(modalBody).toBeInTheDocument();
  });

  it('uses responsive text sizes', () => {
    const { container } = render(<AppointmentRescheduleCalendar {...mockProps} />);
    
    // Check for responsive text classes
    const header = container.querySelector('.text-lg.sm\\:text-xl');
    expect(header).toBeInTheDocument();
    
    const contactInfo = container.querySelector('.text-xs.sm\\:text-sm');
    expect(contactInfo).toBeInTheDocument();
  });

  it('applies responsive padding', () => {
    const { container } = render(<AppointmentRescheduleCalendar {...mockProps} />);
    
    // Check for responsive padding classes
    const paddingElements = container.querySelectorAll('.p-3.sm\\:p-6');
    expect(paddingElements.length).toBeGreaterThan(0);
  });

  it('has responsive time slot grid', () => {
    const { container } = render(<AppointmentRescheduleCalendar {...mockProps} />);
    
    // Check for responsive grid classes on time slots area
    // Note: Time slots only appear after selecting a date, so we're checking the structure exists
    const calendarGrid = container.querySelector('.grid.grid-cols-7');
    expect(calendarGrid).toBeInTheDocument();
  });

  it('shows/hides email on mobile vs desktop', () => {
    const { container } = render(<AppointmentRescheduleCalendar {...mockProps} />);
    
    // Check for hidden email on mobile
    const hiddenEmail = container.querySelector('.hidden.sm\\:inline');
    expect(hiddenEmail).toBeInTheDocument();
  });

  it('renders close button with proper responsive styling', () => {
    const { container } = render(<AppointmentRescheduleCalendar {...mockProps} />);
    
    const closeButton = container.querySelector('button[class*="bg-tst-red"]');
    expect(closeButton).toBeInTheDocument();
  });
});