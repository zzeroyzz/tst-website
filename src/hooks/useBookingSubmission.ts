'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_LEAD_WITH_APPOINTMENT } from '@/lib/graphql/mutations';
import { formatPhoneNumber, validateBookingForm, getCleanPhoneNumber } from '@/lib/validation';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
}

export const useBookingSubmission = (variant: 'nd' | 'affirming' | 'trauma') => {
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [createLeadWithAppointment] = useMutation(CREATE_LEAD_WITH_APPOINTMENT);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      if (formattedValue === 'INVALID_COUNTRY_CODE') {
        setFormError('Only US phone numbers are supported. Please remove international country codes except +1.');
        return;
      }
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

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
    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setFormError(firstError || 'Please check your information and try again.');
      throw new Error('Validation failed');
    }

    if (!hasConsented) {
      setFormError('Please consent to being contacted to continue.');
      throw new Error('Consent required');
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const variables = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: getCleanPhoneNumber(formData.phone),
        appointmentDateTime: selectedAppointment.dateTime.toISOString(),
        timeZone: 'America/New_York',
        segments: [`${variant} Booking Lead`],
        notes: `Grounding plan session booked from ${variant} page`,
        triggerSMSWorkflow: true,
      };

      const { data } = await createLeadWithAppointment({ variables });

      const appointmentResult = (data as any)?.createLeadWithAppointment;

      if (!appointmentResult) throw new Error('Failed to schedule appointment');

      // IMPORTANT: This is the UUID we need
      const contactUuid: string | undefined = appointmentResult.contact?.uuid ?? undefined;

      if (!contactUuid) {
        console.warn('[useBookingSubmission] Missing contactUuid on result.contact');
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
      const emailBody = {
        type: 'APPOINTMENT_BOOKED',
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        appointmentDate: selectedAppointment.displayDate,
        appointmentTime: selectedAppointment.displayTime,
        appointmentDateTime: selectedAppointment.dateTime.toISOString(),
        variant,
        uuid: contactUuid, // <-- ONLY THIS (server expects `uuid`)
      };

      try {
        const resp = await fetch('/api/send-appointment-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailBody),
        });

        const json = await resp.json();
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
      }
    } catch (error: any) {
      console.error('Failed to schedule appointment:', error);

      if (error.graphQLErrors?.length > 0) {
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
    setFormError,
  };
};
