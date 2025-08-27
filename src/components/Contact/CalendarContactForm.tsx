'use client';

import React, { useState } from 'react';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import LeadCalendar from '@/components/LeadCalendar/LeadCalendar';

import { apolloClient } from '@/lib/apollo/client';
import { CREATE_CONTACT_WITH_APPOINTMENT } from '@/lib/graphql/mutations';
import { getCleanPhoneNumber, formatPhoneNumber } from '@/lib/validation';
import toast from 'react-hot-toast';

interface CalendarContactFormProps {
  isContactPage?: boolean;
  id?: string;
}

const CalendarContactForm: React.FC<CalendarContactFormProps> = ({
  isContactPage = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    selectedDateTime: null as Date | null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [step, setStep] = useState<'form' | 'calendar' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      if (formattedValue === 'INVALID_COUNTRY_CODE') {
        setError('Only US phone numbers are supported. Please remove international country codes except +1.');
        return;
      }
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (error) setError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    // Move to calendar step
    setStep('calendar');
  };

  const handleCalendarSchedule = async (dateTime: Date) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_CONTACT_WITH_APPOINTMENT,
        variables: {
          name: formData.name,
          email: formData.email,
          phoneNumber: getCleanPhoneNumber(formData.phone),
          scheduledAt: dateTime.toISOString(),
          timeZone: formData.timezone,
        },
      });

      if ((data as any)?.createContactWithAppointment) {
        setResult((data as any).createContactWithAppointment);
        setStep('success');

        // Show success toast
        toast.success('Consultation scheduled successfully!');

        // Track the lead generation
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'generate_lead_calendar_complete',
            page_source: isContactPage ? 'contact' : 'homepage',
            form_location: window.location.pathname,
            appointment_scheduled: true,
            sms_sent: (data as any).createContactWithAppointment.smsTriggered,
          });
        }
      } else {
        throw new Error('Failed to create contact with appointment');
      }
    } catch (err: any) {
      console.error('Error creating contact with appointment:', err);
      
      // Show error toast
      toast.error('Failed to schedule consultation. Please try again.');
      
      setError(
        err.message || 'Failed to schedule consultation. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setError(null);
  };

  const renderForm = () => (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-10">
        Schedule your consultation.
      </h2>
      <p className="text-lg text-gray-600 mb-10">
        Start by providing your contact information, then choose your preferred
        time.
      </p>

      <form onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-8">
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              className="bg-tst-yellow py-3"
              wrapperClassName="w-full"
            >
              Next: Choose Your Time →
            </Button>
          </div>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );

  const renderCalendar = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Choose your time
        </h2>
        <p className="text-lg text-gray-600 mb-2">
          Hi {formData.name}! Please select your preferred consultation time.
        </p>
        <p className="text-sm text-gray-500">
          All times shown in Eastern Time (ET)
        </p>

        <div className="flex justify-center mt-6">
          <Button
            onClick={handleBackToForm}
            className="bg-gray-100 text-black border-black hover:bg-gray-200"
          >
            ← Back to Contact Info
          </Button>
        </div>
      </div>

      <LeadCalendar
        onSchedule={handleCalendarSchedule}
        contactName={formData.name}
        contactEmail={formData.email}
      />

      {isSubmitting && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
            <span className="text-blue-700">
              Scheduling your consultation...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mt-8 max-w-2xl mx-auto">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-4xl mx-auto text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-4xl font-extrabold mb-6">You're all set!</h2>
      <h3 className="text-3xl font-bold mb-4">Here's what happens next:</h3>

      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 mb-8">
        <h4 className="text-2xl font-bold text-green-800 mb-4">
          Your consultation is scheduled for:
        </h4>
        <p className="text-xl font-bold text-green-700">
          {result?.appointment?.scheduledAt &&
            new Date(result.appointment.scheduledAt).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short',
            })}
        </p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
        <h4 className="text-xl font-bold text-blue-800 mb-3">
          What to expect:
        </h4>
        <ul className="list-disc list-inside space-y-3 text-lg text-left max-w-2xl mx-auto">
          <li>
            You'll receive a confirmation email shortly with all the details
          </li>
          {result?.smsTriggered && (
            <li>A welcome text message has been sent to your phone</li>
          )}
          <li>We'll send you a calendar invite with the video call link</li>
          <li>A brief questionnaire link will be shared before our session</li>
          <li>Feel free to reply to any of our messages with questions</li>
        </ul>
      </div>

      <div className="text-center">
        <Button
          onClick={() => {
            setStep('form');
            setFormData({
              name: '',
              email: '',
              phone: '',
              selectedDateTime: null,
              timezone: formData.timezone,
            });
            setResult(null);
          }}
          className="bg-tst-purple text-black"
        >
          Schedule Another Consultation
        </Button>
      </div>

      {result?.messages && result.messages.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
          <h5 className="font-bold text-gray-800 mb-2">Process Details:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            {result.messages.map((message: string, index: number) => (
              <li key={index}>• {message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative bg-white p-12 rounded-xl border-2 border-black shadow-brutalistLg max-w-7xl mx-auto">
      {step === 'form' && renderForm()}
      {step === 'calendar' && renderCalendar()}
      {step === 'success' && renderSuccess()}
    </div>
  );
};

export default CalendarContactForm;
