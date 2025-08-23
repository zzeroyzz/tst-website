'use client';

import React from 'react';
import BookingPageHeader from './BookingPageHeader';
import CalendarStepComponent from './CalendarStepComponent';
import { useBookingNavigation } from '@/hooks/useBookingNavigation';

interface BookingCalendarPageProps {
  variant: 'nd' | 'affirming' | 'trauma';
}

const BookingCalendarPage: React.FC<BookingCalendarPageProps> = ({ variant }) => {
  const { handleTimeSelection } = useBookingNavigation(variant);

  return (
    <div className="space-y-12">
      <BookingPageHeader variant={variant} />
      <CalendarStepComponent variant={variant} onTimeSelected={handleTimeSelection} />
    </div>
  );
};

export default BookingCalendarPage;