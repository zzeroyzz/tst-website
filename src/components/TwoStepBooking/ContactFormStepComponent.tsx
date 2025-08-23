'use client';

import React, { useState } from 'react';
import { User, Calendar, Clock, Mail, Phone, UserCheck } from 'lucide-react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { SelectedAppointment } from './TwoStepBooking';
import { useMutation } from '@apollo/client/react';
import { CREATE_LEAD_WITH_APPOINTMENT } from '@/lib/graphql/mutations';

interface ContactFormStepComponentProps {
  variant: 'nd' | 'affirming' | 'trauma';
  selectedAppointment: SelectedAppointment;
  onSubmit: (contactData: ContactFormData) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
}

const ContactFormStepComponent: React.FC<ContactFormStepComponentProps> = ({
  variant,
  selectedAppointment,
  onSubmit,
  onBack,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);

  // GraphQL mutation
  const [createLeadWithAppointment] = useMutation(CREATE_LEAD_WITH_APPOINTMENT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasConsented) {
      setFormError('Please consent to being contacted to continue.');
      return;
    }

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
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'booking_completed',
        event_id: crypto.randomUUID(),
        form_name: 'Grounding Plan Session',
        lead_source: `booking_${variant}`,
        appointment_iso: selectedAppointment.dateTime.toISOString(),
        session_type: 'grounding_plan',
      });

      // Call parent onSubmit to transition to success step
      onSubmit(formData);
    } catch (error: any) {
      console.error('Failed to schedule appointment:', error);
      
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const firstError = error.graphQLErrors[0];
        setFormError(firstError.message || 'Failed to schedule appointment. Please try again.');
      } else if (error.networkError) {
        setFormError('Network error. Please check your connection and try again.');
      } else {
        setFormError('Failed to schedule appointment. Please try again.');
      }
    }
  };

  const getVariantContent = () => {
    switch (variant) {
      case 'nd':
        return {
          title: 'Complete Your Neurodivergent-Friendly Session Booking',
          description: 'Just a few details to confirm your free grounding plan session',
        };
      case 'affirming':
        return {
          title: 'Complete Your LGBTQIA-Affirming Session Booking',
          description: 'Just a few details to confirm your free grounding plan session',
        };
      case 'trauma':
        return {
          title: 'Complete Your Session Booking',
          description: 'Just a few details to confirm your free grounding plan session',
        };
    }
  };

  const content = getVariantContent();

  return (
    <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b-2 border-black text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{content.title}</h2>
        <p className="text-lg text-gray-600">{content.description}</p>
      </div>

      {/* Selected Appointment Summary */}
      <div className="p-6 border-b-2 border-black bg-tst-yellow">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Calendar size={18} />
          <span>Your Selected Session</span>
        </h3>
        <div className="bg-white border-2 border-black rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-tst-purple" />
                <span className="font-semibold text-lg">{selectedAppointment.displayDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-tst-purple" />
                <span className="font-medium text-tst-purple">{selectedAppointment.displayTime}</span>
              </div>
            </div>
            <Button
              onClick={onBack}
              className="bg-white text-black border-black hover:bg-gray-100 text-sm py-2 px-3"
            >
              Change Time
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          {/* Email and Phone Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="block font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="consent"
              checked={hasConsented}
              onChange={e => setHasConsented(e.target.checked)}
              className="mt-1 w-4 h-4 text-tst-purple border-gray-300 rounded focus:ring-tst-purple"
              required
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I consent to SMS/email for scheduling and care coordination.
              Reply STOP to opt out. I understand this is not a commitment to
              ongoing therapy services.
            </label>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">{formError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="bg-tst-green text-black border-black py-4 text-lg font-bold hover:shadow-lg"
            wrapperClassName="w-full"
            disabled={isSubmitting || !hasConsented}
          >
            <UserCheck className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Scheduling...' : 'Schedule Consultation'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Questions? Email us at{' '}
            <a
              href="mailto:hello@example.com"
              className="font-medium text-tst-purple hover:underline"
            >
              hello@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactFormStepComponent;