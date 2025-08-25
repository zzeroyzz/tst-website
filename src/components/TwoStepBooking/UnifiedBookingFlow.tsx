'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import CalendarStepComponent from './CalendarStepComponent';
import BookingDetailsForm from './BookingDetailsForm';
import BookingPageHeader from './BookingPageHeader';

interface UnifiedBookingFlowProps {
  variant: 'nd' | 'affirming' | 'trauma';
}

export interface SelectedAppointment {
  dateTime: Date;
  displayDate: string;
  displayTime: string;
}

type BookingStep = 'calendar' | 'details' | 'success';

const UnifiedBookingFlow: React.FC<UnifiedBookingFlowProps> = ({ variant }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  // Handle window dimensions for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle confetti when success step is reached
  useEffect(() => {
    if (currentStep === 'success') {
      setShowConfetti(true);
      
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Memoized handlers to prevent infinite re-renders
  const handleTimeSelection = useCallback((dateTime: Date) => {
    const easternTime = new Date(dateTime);

    const appointment: SelectedAppointment = {
      dateTime,
      displayDate: easternTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/New_York'
      }),
      displayTime: easternTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York'
      }) + ' EST'
    };

    setSelectedAppointment(appointment);
    setCurrentStep('details');
  }, []);

  const handleBackToCalendar = useCallback(() => {
    setCurrentStep('calendar');
  }, []);

  const handleBookingSuccess = useCallback(() => {
    // Redirect to thank you page instead of showing inline success
    router.push('/thank-you');
  }, [router]);

  // Tab configuration
  const tabs = useMemo(() => [
    {
      id: 'calendar',
      label: 'Pick a day and time',
      icon: Calendar,
      active: currentStep === 'calendar',
      completed: currentStep === 'details' || currentStep === 'success'
    },
    {
      id: 'details',
      label: 'Details',
      icon: User,
      active: currentStep === 'details',
      completed: currentStep === 'success',
      disabled: !selectedAppointment
    }
  ], [currentStep, selectedAppointment]);

  // Tab navigation
  const handleTabClick = useCallback((tabId: string) => {
    if (tabId === 'calendar') {
      setCurrentStep('calendar');
    } else if (tabId === 'details' && selectedAppointment) {
      setCurrentStep('details');
    }
  }, [selectedAppointment]);

  // Render tab navigation
  const renderTabs = () => (
    <div className="flex items-center justify-center mb-8 space-x-1 rounded-lg p-1 max-w-md mx-auto gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 shadow-brutalist border-2 border-black
              ${tab.active
                ? 'bg-white text-tst-purple shadow-sm font-bold'
                : tab.completed
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : tab.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200 cursor-pointer'
              }
            `}
          >
            {tab.completed ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  // Selected time display
  const renderSelectedTimeDisplay = () => {
    if (!selectedAppointment || currentStep === 'calendar') return null;

    return (
      <div className="bg-tst-yellow border-2 border-black rounded-lg p-4 mb-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-3">
          <Clock className="w-5 h-5 text-tst-purple" />
          <div className="text-center">
            <p className="font-bold text-lg">{selectedAppointment.displayDate}</p>
            <p className="text-tst-purple font-semibold">{selectedAppointment.displayTime}</p>
          </div>
        </div>
      </div>
    );
  };

  // Success page
  const renderSuccessPage = () => (
    <div data-testid="success-step" className="bg-white rounded-xl border-2 border-black shadow-brutalistLg max-w-4xl mx-auto text-center p-12">
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

  return (
    <div className="space-y-8">
      {/* Confetti for success celebration */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <BookingPageHeader variant={variant} />

      {currentStep !== 'success' && (
        <>
          {renderTabs()}
        </>
      )}

      {/* Step Content */}
      {currentStep === 'calendar' && (
        <CalendarStepComponent
          variant={variant}
          onTimeSelected={handleTimeSelection}
        />
      )}

      {currentStep === 'details' && selectedAppointment && (
        <BookingDetailsForm
          variant={variant}
          selectedAppointment={selectedAppointment}
          onBack={handleBackToCalendar}
          onSuccess={handleBookingSuccess}
        />
      )}

      {currentStep === 'success' && renderSuccessPage()}
    </div>
  );
};

export default UnifiedBookingFlow;
