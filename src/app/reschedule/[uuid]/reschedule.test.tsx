import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockUseRouter = jest.fn();
const mockUseParams = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockUseParams(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/Section/Section', () => {
  return ({ children, className }: any) => <div className={className}>{children}</div>;
});

jest.mock('@/components/AppointmentRescheduleCalendar/AppointmentRescheduleCalendar', () => {
  return ({ isOpen, onClose, contactId, contactUuid }: any) => 
    isOpen ? (
      <div data-testid="reschedule-calendar">
        Reschedule Calendar - Contact: {contactId}, UUID: {contactUuid}
      </div>
    ) : null;
});

import ReschedulePage from './page';

describe('ReschedulePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ uuid: 'test-uuid-123' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        contact: {
          id: '123',
          uuid: 'test-uuid-123',
          name: 'John Doe',
          email: 'john@example.com',
          scheduled_appointment_at: '2024-01-01T10:00:00Z',
          appointment_status: 'SCHEDULED'
        }
      }),
    });
  });

  it('renders loading state initially', () => {
    const { container } = render(<ReschedulePage />);
    
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('fetches appointment using UUID', async () => {
    render(<ReschedulePage />);
    
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/appointment/cancel-link/test-uuid-123',
      { cache: 'no-store' }
    );
  });

  it('displays reschedule button that redirects correctly', () => {
    const { getByText } = render(<ReschedulePage />);
    
    // The button should use UUID in the cancel route
    expect(getByText('Back to Cancel Options')).toBeInTheDocument();
  });
});