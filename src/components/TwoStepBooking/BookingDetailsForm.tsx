'use client';

import React from 'react';
import { User, Calendar, Clock, Mail, Phone, UserCheck, ArrowLeft } from 'lucide-react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { useBookingSubmission } from '@/hooks/useBookingSubmission';

interface BookingDetailsFormProps {
  variant: 'nd' | 'affirming' | 'trauma';
  selectedAppointment: {
    dateTime: Date;
    displayDate: string;
    displayTime: string;
  };
  onBack: () => void;
  onSuccess: () => void;
}

const getVariantContent = (variant: BookingDetailsFormProps['variant']) => {
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

const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({
  variant,
  selectedAppointment,
  onBack,
  onSuccess,
}) => {
  const {
    formData,
    formError,
    hasConsented,
    isSubmitting,
    handleInputChange,
    handleConsentChange,
    submitBooking
  } = useBookingSubmission(variant);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitBooking(selectedAppointment);
      // Call success callback to trigger thank you page
      onSuccess();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Booking submission failed:', error);
    }
  };

  const content = getVariantContent(variant);

  return (
    <div data-testid="details-step" className="bg-white rounded-xl border-2 border-black shadow-brutalistLg max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b-2 border-black text-center">
        <h2 className="text-2xl font-bold mb-2 text-center md:text-center">Complete Your Booking</h2>
        <p className="text-sm md:text-lg text-gray-600 text-center md:text-center">Just a few details to confirm your free 15-min consultation</p>
      </div>

      {/* Contact Form */}
      <div className="p-6">
        {/* Selected Appointment Summary */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">pick a new time</span>
          </button>
          <div className="text-center">
            <p className="font-bold text-xl md:text-2xl text-center md:text-center">{selectedAppointment.displayDate}</p>
            <p className="text-tst-purple font-semibold text-xl md:text-2xl  text-center md:text-center">{selectedAppointment.displayTime}</p>
          </div>
        </div>

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
              onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                placeholder="555-555-5555"
                value={formData.phone}
                onChange={handleInputChange}
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
              onChange={(e) => handleConsentChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-tst-purple border-gray-300 rounded focus:ring-tst-purple"
              required
            />
            <label htmlFor="consent" className="text-xs md:text-sm text-gray-700">
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
            className="bg-tst-green text-black border-black py-4 text-lg font-bold hover:shadow-lg flex items-center justify-center gap-2"
            wrapperClassName="w-full"
            disabled={isSubmitting}
          >
            <UserCheck className="w-5 h-5" />
            <span>{isSubmitting ? 'Scheduling...' : 'Schedule Consultation'}</span>
          </Button>
        </form>


      </div>
    </div>
  );
};

export default BookingDetailsForm;
