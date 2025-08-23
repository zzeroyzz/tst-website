'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Calendar, Clock, Mail, Phone, UserCheck, ArrowLeft } from 'lucide-react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { useBookingNavigation, SelectedAppointment } from '@/hooks/useBookingNavigation';
import { useBookingSubmission } from '@/hooks/useBookingSubmission';

interface BookingDetailsPageProps {
  variant: 'nd' | 'affirming' | 'trauma';
}

const getVariantContent = (variant: BookingDetailsPageProps['variant']) => {
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

const BookingSuccessContent: React.FC = () => (
  <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg max-w-4xl mx-auto text-center p-12">
    <div className="text-6xl mb-6">🎉</div>
    <h2 className="text-3xl font-bold mb-4 text-green-800">
      Session Confirmed!
    </h2>
    <p className="text-lg text-gray-700 mb-6">
      Your free grounding plan session is scheduled. You'll receive a
      confirmation email with all the details shortly.
    </p>

    <div className="bg-tst-yellow border-2 border-black rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">What to expect:</h3>
      <div className="space-y-3 text-left max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-tst-purple rounded-full mt-2 flex-shrink-0"></div>
          <span>We'll identify your specific triggers and stress patterns</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-tst-purple rounded-full mt-2 flex-shrink-0"></div>
          <span>You'll learn 3 personalized grounding techniques</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-tst-purple rounded-full mt-2 flex-shrink-0"></div>
          <span>Leave with a custom plan you can use immediately</span>
        </div>
      </div>
    </div>
  </div>
);

const BookingDetailsPage: React.FC<BookingDetailsPageProps> = ({ variant }) => {
  const router = useRouter();
  const { getStoredAppointment, clearStoredAppointment } = useBookingNavigation(variant);
  const {
    formData,
    formError,
    hasConsented,
    isSubmitting,
    isSuccess,
    handleInputChange,
    handleConsentChange,
    submitBooking
  } = useBookingSubmission(variant);

  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);

  useEffect(() => {
    const stored = getStoredAppointment();
    if (!stored) {
      // No appointment selected, redirect back to calendar
      const calendarPath = variant === 'trauma' ? '/book' : `/book/${variant}`;
      router.push(calendarPath);
      return;
    }
    setSelectedAppointment(stored);
  }, [router, variant]); // Removed getStoredAppointment from dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppointment) return;

    try {
      await submitBooking(selectedAppointment);
      clearStoredAppointment();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleBackToCalendar = () => {
    const calendarPath = variant === 'trauma' ? '/book' : `/book/${variant}`;
    router.push(calendarPath);
  };

  const content = getVariantContent(variant);

  if (isSuccess) {
    return <BookingSuccessContent />;
  }

  if (!selectedAppointment) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b-2 border-black text-center">
        <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
        <p className="text-lg text-gray-600">{content.description}</p>
      </div>

      {/* Selected Appointment Summary */}
      <div className="p-6 border-b-2 border-black bg-tst-yellow">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Calendar size={18} />
          <span>Your Selected Session</span>
        </h2>
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
              onClick={handleBackToCalendar}
              className="bg-white text-black border-black hover:bg-gray-100 text-sm py-2 px-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
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
                placeholder="(555) 123-4567"
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

export default BookingDetailsPage;
