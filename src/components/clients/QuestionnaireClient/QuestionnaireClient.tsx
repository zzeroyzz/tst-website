/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/app/questionnaire/[token]/QuestionnaireClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '@/components/Section/Section';
import Button from '@/components/Button/Button';
import Confetti from 'react-confetti';
import { CheckSquare, Square, ArrowRight, ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import useInterceptCalendlyAnalytics from '@/hooks/useInterceptCalendlyAnalytics';
import LeadCalendar from '@/components/LeadCalendar/LeadCalendar';
import QuestionnaireSkeleton from '@/components/skeleton/QuestionnaireSkeleton';
import styles from './QuestionaaireClient.module.css';
import Image from 'next/image';
import { workingOnOptions, schedulingOptions, paymentOptions, budgetOptions, therapyFunds } from '@/data/questionaireData';

interface Contact {
  id: string;
  name: string;
  email: string;
}

export default function QuestionnaireClient({
  params
}: {
  params: Promise<{ token: string }>
}) {
  const [token, setToken] = useState<string>('');
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // Form state
  const [isInGeorgia, setIsInGeorgia] = useState<boolean | null>(null);
  const [interestedIn, setInterestedIn] = useState<string[]>([]);
  const [schedulingPreference, setSchedulingPreference] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [budgetWorks, setBudgetWorks] = useState<boolean | null>(null);
  const [hasScheduled, setHasScheduled] = useState<boolean>(false);
  const [submittedOutOfState, setSubmittedOutOfState] = useState(false);
  const [submittedBudgetNo, setSubmittedBudgetNo] = useState(false);

  // Appointment confirmation
  const [appointmentConfirmed, setAppointmentConfirmed] = useState<boolean>(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);

  // Window size for confetti
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
// helper calls already exist; use silent versions that DON'T redirect
const markOutOfStateSilently = async () => {
  try {
    await fetch(`/api/questionnaire/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isInGeorgia: false })
    });
  } catch (e) {
    console.error('Silent out-of-state POST failed', e);
  }
};

const markBudgetNoSilently = async () => {
  try {
    await fetch(`/api/questionnaire/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isInGeorgia: true, budgetWorks: false })
    });
  } catch (e) {
    console.error('Silent budget=no POST failed', e);
  }
};
// EFFECT 1: when user picks "No, I'm not in Georgia"
useEffect(() => {
  if (token && isInGeorgia === false && !submittedOutOfState) {
    setSubmittedOutOfState(true);
    markOutOfStateSilently(); // sets located_in_georgia=false, qualified_lead=false, completed=true
  }
}, [token, isInGeorgia, submittedOutOfState]);

// EFFECT 2: when user picks "No, I need to explore other options"
useEffect(() => {
  if (token && isInGeorgia === true && budgetWorks === false && !submittedBudgetNo) {
    setSubmittedBudgetNo(true);
    markBudgetNoSilently(); // sets located_in_georgia=true, qualified_lead=false, budget_works=false, completed=true
  }
}, [token, isInGeorgia, budgetWorks, submittedBudgetNo]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useInterceptCalendlyAnalytics();

  // Save form state locally (debounced in a separate effect)
  const saveFormState = () => {
    if (typeof window !== 'undefined' && token && !loading && !alreadyCompleted && !error) {
      const formState = {
        currentStep,
        isInGeorgia,
        interestedIn,
        schedulingPreference,
        paymentMethod,
        budgetWorks,
        hasScheduled,
        appointmentConfirmed,
        scheduledDateTime: scheduledDateTime?.toISOString(),
        timestamp: Date.now()
      };
      localStorage.setItem(`questionnaire-${token}`, JSON.stringify(formState));
    }
  };

  // Load saved local state
  const loadFormState = () => {
    if (typeof window !== 'undefined' && token) {
      const savedState = localStorage.getItem(`questionnaire-${token}`);

      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          const isRecent = Date.now() - parsedState.timestamp < 24 * 60 * 60 * 1000;

          if (isRecent) {
            setCurrentStep(parsedState.currentStep ?? 0);
            setIsInGeorgia(parsedState.isInGeorgia ?? null);
            setInterestedIn(parsedState.interestedIn ?? []);
            setSchedulingPreference(parsedState.schedulingPreference ?? '');
            setPaymentMethod(parsedState.paymentMethod ?? '');
            setBudgetWorks(parsedState.budgetWorks ?? null);
            setHasScheduled(parsedState.hasScheduled ?? false);
            setAppointmentConfirmed(parsedState.appointmentConfirmed ?? false);
            if (parsedState.scheduledDateTime) {
              setScheduledDateTime(new Date(parsedState.scheduledDateTime));
            }
            return true;
          } else {
            localStorage.removeItem(`questionnaire-${token}`);
          }
        } catch {
          localStorage.removeItem(`questionnaire-${token}`);
        }
      }
    }
    return false;
  };

  // Clear saved state when form is completed
  const clearFormState = () => {
    if (typeof window !== 'undefined' && token) {
      localStorage.removeItem(`questionnaire-${token}`);
    }
  };

  // --- API helpers for branch completions / pre-marking ---

  // Out-of-state: mark located_in_georgia=false, qualified_lead=false, completed=true
  const completeOutOfState = async () => {
    try {
      await fetch(`/api/questionnaire/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isInGeorgia: false })
      });
      clearFormState();
      toast.success("Thanks! We've shared some resources.");
      window.location.href = '/';
    } catch (err) {
      console.error('Out-of-state completion failed:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Budget not fit (in-state): mark located_in_georgia=true, budget_works=false, qualified_lead=false, completed=true
  const completeBudgetNotFit = async () => {
    try {
      await fetch(`/api/questionnaire/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isInGeorgia: true, budgetWorks: false })
      });
      clearFormState();
      toast.success('Thanks! We’ve shared lower-cost options.');
      window.location.href = '/';
    } catch (err) {
      console.error('Budget-not-fit completion failed:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Pre-mark qualified (in GA + budget works) without completing the questionnaire yet
  useEffect(() => {
    const preMarkQualified = async () => {
      try {
        await fetch(`/api/questionnaire/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isInGeorgia: true, budgetWorks: true })
        });
      } catch (e) {
        // Non-blocking; just log
        console.error('Pre-mark qualified failed:', e);
      }
    };

    if (currentStep === 5 && isInGeorgia === true && budgetWorks === true) {
      preMarkQualified();
    }
  }, [currentStep, isInGeorgia, budgetWorks, token]);

  // --- Steps / progress ---

  const getTotalSteps = () => {
    // If user is not in Georgia, we only have 2 steps (location + out of state message)
    if (isInGeorgia === false) return 2;
    // Otherwise full 6-step flow
    return 6;
  };

  const getProgressStep = () => currentStep + 1;

  // Initial fetch and setup
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const resolvedParams = await params;
        setToken(resolvedParams.token);

        const response = await fetch(`/api/questionnaire/${resolvedParams.token}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            setAlreadyCompleted(true);
            setError(data.error);
            clearFormState();
          } else {
            setError(data.error);
          }
          return;
        }
        setContact(data.contact);
      } catch (err) {
        setError('Failed to load questionnaire. Please try again.');
        console.error('Error fetching contact:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [params]);

  // Load saved state when ready
  useEffect(() => {
    if (token && !loading && !alreadyCompleted && !error) {
      const loaded = loadFormState();
      if (!loaded) setCurrentStep(0);
    }
  }, [token, loading, alreadyCompleted, error]);

  // Debounced local persistence
  useEffect(() => {
    if (token && !loading && !alreadyCompleted && !error) {
      const t = setTimeout(saveFormState, 100);
      return () => clearTimeout(t);
    }
  }, [
    currentStep,
    isInGeorgia,
    interestedIn,
    schedulingPreference,
    paymentMethod,
    budgetWorks,
    hasScheduled,
    appointmentConfirmed,
    scheduledDateTime,
    token,
    loading,
    alreadyCompleted,
    error
  ]);

  const handleInterestedToggle = (option: string) => {
    setInterestedIn(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: // Location question
        return isInGeorgia !== null;
      case 1: // Out of state message OR interested in
        if (isInGeorgia === false) return true;
        return interestedIn.length > 0;
      case 2: // Scheduling
        return schedulingPreference !== '';
      case 3: // Payment
        return paymentMethod !== '';
      case 4: // Budget
        return budgetWorks !== null;
      case 5: // Final step (scheduling or resources)
        if (budgetWorks === true) {
          return hasScheduled || appointmentConfirmed;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedToNextStep()) {
      toast.error('Please answer the question to continue.');
      return;
    }
    if (currentStep === 0 && isInGeorgia === false) {
      setCurrentStep(1); // Go to out of state message
    } else {
      setCurrentStep(prev => Math.min(prev + 1, getTotalSteps() - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleAppointmentScheduled = async (dateTime: Date) => {
    try {
      // Send to your API with questionnaire data
      const response = await fetch('/api/schedule-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          contactId: contact?.id,
          name: contact?.name,
          email: contact?.email,
          dateTime: dateTime.toISOString(),
          questionnaireData: {
            isInGeorgia,
            interestedIn,
            schedulingPreference,
            paymentMethod,
            budgetWorks
          }
        })
      });

      if (response.ok) {
        setHasScheduled(true);
        setAppointmentConfirmed(true);
        setScheduledDateTime(dateTime);
        toast.success('Perfect! Your consultation is confirmed.');

        // Backup save of questionnaire completion
        await fetch(`/api/questionnaire/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interestedIn,
            schedulingPreference,
            paymentMethod,
            budgetWorks,
            isInGeorgia,
            complete: true
          })
        });

        window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'generate_lead',
            event_id: crypto.randomUUID(),           // helps dedupe if you ever dual-send
            form_name: 'Consultation Scheduler',
            lead_source: 'Questionnaire',
            contact_id: contact?.id ?? null,         // avoid PII like email
            appointment_iso: dateTime.toISOString(),
            appointment_tz_offset_min: new Date().getTimezoneOffset() * -1,
            is_in_georgia: !!isInGeorgia,
            interested_in: interestedIn,             // e.g. 'Therapy'
            scheduling_preference: schedulingPreference,
            payment_method: paymentMethod,           // e.g. 'HSA/FSA'
            budget_works: !!budgetWorks
      });

        clearFormState();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Failed to schedule:', error);
      toast.error('Failed to schedule appointment. Please try again.');
      throw error;
    }
  };

  const getStepTitle = () => {
    if (currentStep === 1 && isInGeorgia === false) {
      return "Service Area";
    }

    switch (currentStep) {
      case 0:
        return `Hey ${contact?.name?.split(' ')[0]}! Are you located in Georgia?`;
      case 1:
        return "What are you interested in working on?";
      case 2:
        return "How often would you like to meet?";
      case 3:
        return "How do you plan to pay?";
      case 4:
        return "Does our rate work for you?";
      case 5:
        if (budgetWorks === true) {
          return appointmentConfirmed ? "Your consultation is scheduled!" : "Great! Let's schedule your consultation";
        } else if (budgetWorks === false) {
          return "Other Support Options";
        }
        return "";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    if (currentStep === 1 && isInGeorgia === false) {
      return "Unfortunately, we are only able to provide services to clients located in Georgia at this time.";
    }

    switch (currentStep) {
      case 0:
        return "We currently provide services to clients in Georgia";
      case 1:
        return "Select all that apply";
      case 2:
        return "Choose your preferred scheduling";
      case 3:
        return "Pick how you want to pay";
      case 4:
        return "Our rate is $150 per session";
      case 5:
        if (budgetWorks === true) {
          return appointmentConfirmed ? "" : "Choose a time that works for you";
        } else if (budgetWorks === false) {
          return "If my rate isn't accessible right now, here are some affordable and identity-affirming options that might be a better fit for your budget.";
        }
        return "";
      default:
        return "";
    }
  };

  // Determine if we should show navigation buttons
  const isOutOfState = currentStep === 1 && isInGeorgia === false;
  const showPreviousButton =
    currentStep !== 0 &&
    !isOutOfState &&
    (!appointmentConfirmed || currentStep !== 5) &&
    !(currentStep === 5 && budgetWorks === false);
  const showNextButton =
    currentStep < getTotalSteps() - 1 && !appointmentConfirmed && !isOutOfState;
  const showReturnHomeButton =
    isOutOfState || (appointmentConfirmed && currentStep === 5) || (currentStep === 5 && budgetWorks === false);

  if (loading) {
    return <QuestionnaireSkeleton />;
  }

  if (error) {
    return (
      <Section className="min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Oops!</h1>
          <Image
            src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/questionaire-images/Oops%20questionnaire.png"
            alt={'Confirmation cloud'}
            width={300}
            height={300}
            className="mx-auto"
          />
          <p className="text-lg mb-6">{error}</p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-tst-purple"
          >
            Return Home
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-gray-50 flex items-center justify-center overflow-x-hidden no-padding">
      <div className="w-full max-w-2xl mx-auto px-4 max-h-24">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {getProgressStep()} of {getTotalSteps()}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round((getProgressStep() / getTotalSteps()) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 border border-black overflow-hidden">
            <motion.div
              className="bg-tst-purple h-full rounded-full border-r border-black"
              initial={{ width: 0 }}
              animate={{ width: `${(getProgressStep() / getTotalSteps()) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          layout
          className="bg-white rounded-xl border-2 border-black shadow-brutalistLg overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentStep}
              className="text-center"
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {getStepTitle()}
              </h1>
              <p className="text-lg text-gray-600">
                {getStepSubtitle()}
              </p>
            </motion.div>
          </div>

          {/* Question Content */}
          <div className="pl-2 pr-2 md:px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-0"
              >
                {/* Step 0: Location Question */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button

                        onClick={() => setIsInGeorgia(true)}
                        className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-black transition-all hover:shadow-md ${
                          isInGeorgia === true
                            ? 'bg-tst-purple text-black shadow-md'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 ${
                          isInGeorgia === true ? 'bg-black' : 'bg-white'
                        }`}>
                          {isInGeorgia === true && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium text-lg">Yes, I&apos;m in Georgia</span>
                      </Button>

                      <Button

                        onClick={() => setIsInGeorgia(false)}
                        className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-black transition-all hover:shadow-md ${
                          isInGeorgia === false
                            ? 'bg-tst-purple text-black shadow-md'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 ${
                          isInGeorgia === false ? 'bg-black' : 'bg-white'
                        }`}>
                          {isInGeorgia === false && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium text-lg">No, I&apos;m not in Georgia</span>
                      </Button>
                    </div>

                    <div className="flex items-center justify-center mt-6">
                      <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                      <p className="text-sm text-gray-500">
                        Due to licensing requirements, we can only serve clients located in Georgia
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 1: Out of State Message OR Interested In */}
                {currentStep === 1 && (
                  <>
                    {isInGeorgia === false ? (
                      <div className="text-center space-y-6">
                        <Image
                          src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/questionaire-images/Service%20area.png"
                          alt={'Out of state'}
                          width={200}
                          height={200}
                          className="mx-auto"
                        />
                        <div className="bg-blue-50 border-2 border-black rounded-lg p-6">
                          <p className="text-gray-700 mb-4">
                            We appreciate your interest in our services. While we can&apos;t work together at this time due to state licensing requirements, we encourage you to seek support from a licensed therapist in your state.
                          </p>
                          <p className="text-sm text-gray-600">
                            You can find qualified therapists in your area through{" "}
                            <a
                              href="https://www.inclusivetherapists.com"
                              className="font-bold underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Inclusive Therapists
                            </a>{" "}
                            or{" "}
                            <a
                              href="https://openpathcollective.org"
                              className="font-bold underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open Path Collective
                            </a>
                            , or by contacting your insurance provider for <br /> in-network options.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-600 mb-4">Select all that apply</p>
                        {/* Wrap scrollable content in relative container for gradient */}
                        <div className="relative">
                          <div
                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                            style={{
                              maxHeight: window.innerWidth < 768 ? '400px' : 'none',
                              overflowY: window.innerWidth < 768 ? 'auto' : 'visible'
                            }}
                          >
                            {workingOnOptions.map((option) => (
                              <Button
                                key={option}

                                onClick={() => handleInterestedToggle(option)}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 border-black transition-all hover:shadow-md text-left ${
                                  interestedIn.includes(option)
                                    ? 'bg-tst-purple text-black shadow-md'
                                    : 'bg-white hover:bg-gray-50'
                                }`}
                              >
                                {interestedIn.includes(option) ? (
                                  <CheckSquare className="w-5 h-5 flex-shrink-0" />
                                ) : (
                                  <Square className="w-5 h-5 flex-shrink-0" />
                                )}
                                <span className="font-medium break-words">{option}</span>
                              </Button>
                            ))}
                          </div>

                          {/* Gradient fade indicator - only visible on mobile */}
                          <div
                            className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none md:hidden"
                            style={{
                              display: window.innerWidth < 768 ? 'block' : 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Step 2: Scheduling */}
                {currentStep === 2 && (
                  <div className="space-y-4 pr-2">
                    {/* Grid layout: 2 buttons on top row, 1 button on bottom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {schedulingOptions.slice(0, 2).map((option) => (
                        <Button
                          key={option.value}

                          onClick={() => setSchedulingPreference(option.value)}
                          className={`flex items-center gap-3 p-6 rounded-lg border-2 border-black transition-all hover:shadow-md text-left ${
                            schedulingPreference === option.value
                              ? 'bg-tst-yellow text-black shadow-md'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 ${
                            schedulingPreference === option.value ? 'bg-transparent' : 'bg-white'
                          }`}>
                            {schedulingPreference === option.value && (
                              <div className="w-2 h-2 rounded-full bg-black"></div>
                            )}
                          </div>
                          <span className="font-medium text-lg break-words">{option.label}</span>
                        </Button>
                      ))}
                    </div>

                    {/* Third button spans full width */}
                    {schedulingOptions.slice(2).map((option) => (
                      <Button
                        key={option.value}

                        onClick={() => setSchedulingPreference(option.value)}
                        className={`w-full flex items-center gap-3 p-6 rounded-lg border-2 border-black transition-all hover:shadow-md text-left ${
                          schedulingPreference === option.value
                            ? 'bg-tst-yellow text-black shadow-md'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 ${
                          schedulingPreference === option.value ? 'bg-transparent' : 'bg-white'
                        }`}>
                          {schedulingPreference === option.value && (
                            <div className="w-2 h-2 rounded-full bg-black"></div>
                          )}
                        </div>
                        <span className="font-medium text-lg break-words">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <div className={`space-y-4 pr-2 ${styles.centerColumn}`}>
                    {/* Grid layout: 2 buttons on top row, 1 button on bottom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {paymentOptions.slice(0, 2).map((option) => (
                        <Button
                          key={option.value}

                          onClick={() => setPaymentMethod(option.value)}
                          className={`flex items-center gap-3 p-6 rounded-lg border-2 border-black transition-all text-left ${
                            paymentMethod === option.value
                              ? 'bg-tst-teal text-black shadow-md'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === option.value ? 'bg-transparent' : 'bg-white'
                          }`}>
                            {paymentMethod === option.value && (
                              <div className="w-2 h-2 rounded-full bg-black"></div>
                            )}
                          </div>
                          <span className="font-medium text-lg break-words">{option.label}</span>
                        </Button>
                      ))}

                      {/* Third button spans both columns on desktop */}
                      <div className="md:col-span-2 md:col-start-1 md:col-end-3">
                        {paymentOptions.slice(2).map((option) => (
                          <Button
                            key={option.value}

                            onClick={() => setPaymentMethod(option.value)}
                            className={`w-full flex items-center gap-3 p-6 rounded-lg border-2 border-black transition-all hover:shadow-md text-left ${
                              paymentMethod === option.value
                                ? 'bg-tst-teal text-black shadow-md'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 ${
                              paymentMethod === option.value ? 'bg-transparent' : 'bg-white'
                            }`}>
                              {paymentMethod === option.value && (
                                <div className="w-2 h-2 rounded-full bg-black"></div>
                              )}
                            </div>
                            <span className="font-medium text-lg break-words">{option.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Budget */}
                {currentStep === 4 && (
                  <div className={`space-y-4 pr-2 ${styles.centerColumn}`}>
                    {budgetOptions.map((option) => (
                      <Button
                        key={option.value.toString()}

                        onClick={() => setBudgetWorks(option.value)}
                        className={`w-full flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-black transition-all hover:shadow-md ${
                          budgetWorks === option.value
                            ? 'bg-tst-green text-black shadow-md'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 ${
                          budgetWorks === option.value ? 'bg-black' : 'bg-white'
                        }`}>
                          {budgetWorks === option.value && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium text-lg break-words text-center flex-1">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Step 5: Conditional Content */}
                {currentStep === 5 && (
                  <div className="pr-2">
                    {/* If budget works - show custom calendar */}
                    {budgetWorks === true && (
                      <div className="space-y-4">
                        {!appointmentConfirmed ? (
                          <LeadCalendar
                            contactId={contact?.id}
                            contactName={contact?.name}
                            contactEmail={contact?.email}
                            onSchedule={handleAppointmentScheduled}
                          />
                        ) : (
                          <>
                            <Confetti
                              width={window.innerWidth}
                              height={window.innerHeight}
                              recycle={false}
                              numberOfPieces={800}
                              tweenDuration={10000}
                              style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
                            />
                            <div className="text-center p-6 bg-green-50 rounded-lg">
                              <Image
                                src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/questionaire-images/Congrats%20questionnaire.png"
                                alt={'Confirmation cloud'}
                                width={200}
                                height={200}
                                className="mx-auto"
                              />
                              <h3 className="text-2xl font-bold text-green-800 mb-2">
                                Consultation Scheduled!
                              </h3>
                              <p className="text-green-700 mb-4">
                                Your consultation is confirmed for{' '}
                                {scheduledDateTime && (
                                  <span className="font-semibold">
                                    {scheduledDateTime.toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })} at {scheduledDateTime.toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-green-600">
                                You&rsquo;ll receive a confirmation email with all the details shortly.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* If budget doesn't work - show therapy fund resources */}
                    {budgetWorks === false && (
                      <div className="space-y-4">
                        {therapyFunds.map((fund, index) => (
                          <div
                            key={index}
                            className="p-4 border-2 border-black rounded-lg bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg">{fund.name}</h3>
                              <a
                                href={fund.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <ExternalLink size={16} />
                              </a>
                            </div>
                            <p className="text-tst-purple font-medium mb-2">{fund.description}</p>
                            <p className="text-sm text-gray-600">{fund.details}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-8 py-6 border-t-2 border-black">
            <div className="flex justify-between items-center gap-4">
              {/* Previous Button - Hidden on step 0 and when appointment is confirmed on step 5 */}
              {showPreviousButton && (
                <Button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 min-w-fit bg-gray-200"
                >
                  <ArrowLeft size={16} className="flex-shrink-0" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              )}

              {/* Spacer when previous Button is hidden */}
              {!showPreviousButton && <div></div>}

              {/* Continue Button - Hidden when appointment is confirmed */}
              {showNextButton && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNextStep()}
                  className={`flex items-center gap-2 min-w-fit ${
                    canProceedToNextStep() ? 'bg-tst-purple' : 'bg-gray-300'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight size={16} className="flex-shrink-0" />
                </Button>
              )}

              {/* Return Home Button */}
              {showReturnHomeButton && (
                <Button
                  onClick={() => {
                    if (isOutOfState) {
                      // Submit minimal out-of-state completion so DB columns update
                      completeOutOfState();
                    } else if (currentStep === 5 && budgetWorks === false) {
                      // In GA but budget doesn't work – finalize with minimal completion
                      completeBudgetNotFit();
                    } else {
                      window.location.href = '/';
                    }
                  }}
                  className="flex items-center gap-2 min-w-fit bg-tst-green"
                >
                  <span>Return Home</span>
                  <ArrowRight size={16} className="flex-shrink-0" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
