'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_LEAD_WITH_APPOINTMENT } from '@/lib/graphql/mutations';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
}

export const useBookingSubmission = (variant: 'nd' | 'affirming' | 'trauma') => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // GraphQL mutation
  const [createLeadWithAppointment] = useMutation(CREATE_LEAD_WITH_APPOINTMENT);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError(null);
  };

  const handleConsentChange = (checked: boolean) => {
    setHasConsented(checked);
    if (formError) setFormError(null);
  };

  const submitBooking = useCallback(async (selectedAppointment: {
    dateTime: Date;
    displayDate: string;
    displayTime: string;
  }): Promise<void> => {
    if (!hasConsented) {
      setFormError('Please consent to being contacted to continue.');
      throw new Error('Consent required');
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Use GraphQL mutation to schedule appointment
      const { data } = await createLeadWithAppointment({
        variables: {
          name: formData.name,
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          appointmentDateTime: selectedAppointment.dateTime.toISOString(),
          timeZone: 'America/New_York',
          segments: [`${variant} Booking Lead`],
          notes: `Grounding plan session booked from ${variant} page`,
          triggerSMSWorkflow: true,
        },
      });

      if (!(data as any)?.createLeadWithAppointment) {
        throw new Error('Failed to schedule appointment');
      }

      // Track successful booking
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'booking_completed',
          event_id: crypto.randomUUID(),
          form_name: 'Grounding Plan Session',
          lead_source: `booking_${variant}`,
          appointment_iso: selectedAppointment.dateTime.toISOString(),
          session_type: 'grounding_plan',
        });
      }

      setIsSuccess(true);

      // Send confirmation emails directly
      try {
        await fetch('/api/send-appointment-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'APPOINTMENT_BOOKED',
            clientName: formData.name,
            clientEmail: formData.email,
            clientPhone: formData.phone,
            appointmentDate: selectedAppointment.displayDate,
            appointmentTime: selectedAppointment.displayTime,
            appointmentDateTime: selectedAppointment.dateTime.toISOString(),
            variant,
          }),
        });
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
        // Don't fail the booking if email fails
      }
    } catch (error: any) {
      console.error('Failed to schedule appointment:', error);
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const firstError = error.graphQLErrors[0];
        setFormError(firstError.message || 'Failed to schedule appointment. Please try again.');
      } else if (error.networkError) {
        setFormError('Network error. Please check your connection and try again.');
      } else if (error.message !== 'Consent required') {
        setFormError('Failed to schedule appointment. Please try again.');
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, hasConsented, variant, createLeadWithAppointment]);

  return {
    formData,
    formError,
    hasConsented,
    isSubmitting,
    isSuccess,
    handleInputChange,
    handleConsentChange,
    submitBooking,
    setFormError
  };
};