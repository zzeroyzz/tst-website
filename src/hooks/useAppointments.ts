// src/hooks/useAppointments.ts
import { useState, useEffect } from 'react';
import { Contact } from '@/types/contact';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact/appointments');

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const refreshAppointments = () => {
    fetchAppointments();
  };

  return {
    appointments,
    loading,
    error,
    refreshAppointments,
  };
};
