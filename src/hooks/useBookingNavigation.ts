'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { format as formatTz } from 'date-fns-tz';

export interface SelectedAppointment {
  dateTime: Date;
  displayDate: string;
  displayTime: string;
}

const EASTERN_TIMEZONE = 'America/New_York';

export const useBookingNavigation = (variant: 'nd' | 'affirming' | 'trauma') => {
  const router = useRouter();
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);

  const handleTimeSelection = (dateTime: Date) => {
    const easternTime = new Date(dateTime);
    
    const appointment: SelectedAppointment = {
      dateTime,
      displayDate: format(easternTime, 'EEEE, MMMM d, yyyy'),
      displayTime: formatTz(easternTime, 'h:mm a', { timeZone: EASTERN_TIMEZONE }) + ' EST'
    };
    
    setSelectedAppointment(appointment);
    
    // Store appointment data in sessionStorage for the details page
    sessionStorage.setItem('selectedAppointment', JSON.stringify(appointment));
    
    // Navigate to details page based on variant
    const detailsPath = variant === 'trauma' ? '/book/details' : `/book/${variant}/details`;
    router.push(detailsPath);
  };

  const getStoredAppointment = (): SelectedAppointment | null => {
    if (typeof window === 'undefined') return null;
    
    const stored = sessionStorage.getItem('selectedAppointment');
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      // Reconstruct the Date object
      return {
        ...parsed,
        dateTime: new Date(parsed.dateTime)
      };
    } catch {
      return null;
    }
  };

  const clearStoredAppointment = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('selectedAppointment');
    }
  };

  return {
    selectedAppointment,
    handleTimeSelection,
    getStoredAppointment,
    clearStoredAppointment
  };
};