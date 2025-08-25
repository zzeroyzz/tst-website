'use client';

import React, { useState } from 'react';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { format as formatTz } from 'date-fns-tz';

// Components
import Button from '@/components/Button/Button';
import CalendarStepComponent from './CalendarStepComponent';
import ContactFormStepComponent from './ContactFormStepComponent';

interface TwoStepBookingProps {
  variant: 'nd' | 'affirming' | 'trauma';
}

export interface SelectedAppointment {
  dateTime: Date;
  displayDate: string;
  displayTime: string;
}

type BookingStep = 'calendar' | 'contact-form' | 'success';

const EASTERN_TIMEZONE = 'America/New_York';

const TwoStepBooking: React.FC<TwoStepBookingProps> = ({ variant }) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Calendar selection completed
  const handleCalendarSelection = (dateTime: Date) => {
    const easternTime = new Date(dateTime);
    
    const appointment: SelectedAppointment = {
      dateTime,
      displayDate: format(easternTime, 'EEEE, MMMM d, yyyy'),
      displayTime: formatTz(easternTime, 'h:mm a', { timeZone: EASTERN_TIMEZONE }) + ' EST'
    };
    
    setSelectedAppointment(appointment);
    setCurrentStep('contact-form');
  };

  // Step 2: Contact form completed - final booking
  const handleContactFormSubmit = (contactData: any) => {
    // The ContactFormStepComponent handles the actual booking
    // This callback is for final step transition after successful booking
    setCurrentStep('success');
  };

  // Navigate back to calendar
  const handleBackToCalendar = () => {
    setCurrentStep('calendar');
    setSelectedAppointment(null);
  };

  // Progress indicator
  const renderProgressIndicator = () => (
    <div className="flex items-center justify-center mb-8 space-x-4">
      <div className={`flex items-center space-x-2 ${currentStep === 'calendar' ? 'text-tst-purple font-bold' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
          currentStep === 'calendar' ? 'bg-tst-purple text-white border-tst-purple' : 'border-gray-300'
        }`}>
          <Calendar className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium">Select Time</span>
      </div>
      
      <div className={`w-12 h-0.5 ${currentStep === 'contact-form' || currentStep === 'success' ? 'bg-tst-purple' : 'bg-gray-300'}`} />
      
      <div className={`flex items-center space-x-2 ${currentStep === 'contact-form' ? 'text-tst-purple font-bold' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
          currentStep === 'contact-form' ? 'bg-tst-purple text-white border-tst-purple' : 
          currentStep === 'success' ? 'bg-green-500 text-white border-green-500' : 'border-gray-300'
        }`}>
          <User className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium">Your Details</span>
      </div>
    </div>
  );

  // Selected time display (for contact form step)
  const renderSelectedTimeDisplay = () => {
    if (!selectedAppointment || currentStep !== 'contact-form') return null;

    return (
      <div className="bg-tst-yellow border-2 border-black rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-tst-purple" />
            <div>
              <p className="font-bold text-lg">{selectedAppointment.displayDate}</p>
              <p className="text-tst-purple font-semibold">{selectedAppointment.displayTime}</p>
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
    );
  };

  return (
    <div className="space-y-6">
      {renderProgressIndicator()}
      {renderSelectedTimeDisplay()}
      
      {/* Step Content */}
      {currentStep === 'calendar' && (
        <CalendarStepComponent
          variant={variant}
          onTimeSelected={handleCalendarSelection}
        />
      )}
      
      {currentStep === 'contact-form' && selectedAppointment && (
        <ContactFormStepComponent
          variant={variant}
          selectedAppointment={selectedAppointment}
          onSubmit={handleContactFormSubmit}
          onBack={handleBackToCalendar}
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 'success' && (
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
      )}
    </div>
  );
};

export default TwoStepBooking;