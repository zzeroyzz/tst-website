/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/cancel-appointment/[token]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Section from '@/components/Section/Section';
import Button from '@/components/Button/Button';
import { Calendar, Clock, X, Check } from 'lucide-react';
import { format, toZonedTime } from 'date-fns-tz'; // CHANGED: Import from date-fns-tz
import toast from 'react-hot-toast';

// ADDED: Define the timezone constant
const EASTERN_TIMEZONE = 'America/New_York';

interface Contact {
  id: string;
  name: string;
  last_name: string;
  email: string;
  scheduled_appointment_at: string;
  appointment_status: string;
}

export default function CancelAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string>('');


  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/api/appointment/cancel-link/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Appointment not found');
          return;
        }

        setContact(data.contact);
      } catch (err) {
        setError('Failed to load appointment details');
        console.error('Error fetching appointment:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAppointment();
    }
  }, [token]);

  const handleCancel = async () => {
    if (!contact) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/appointment/cancel-link/${token}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel appointment');
      }

      setCancelled(true);
      toast.success('Appointment cancelled successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel appointment');
      console.error('Cancel error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tst-purple"></div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center w-full max-w-md bg-white p-6 sm:p-8 rounded-xl border-2 border-black shadow-brutalistLg">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
          <p className="text-lg mb-6">{error}</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-tst-purple w-full sm:w-auto"
          >
            Return Home
          </Button>
        </div>
      </Section>
    );
  }

  if (cancelled) {
    return (
      <Section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center w-full max-w-md bg-white p-6 sm:p-8 rounded-xl border-2 border-black shadow-brutalistLg">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Appointment Cancelled</h1>
          <p className="text-lg mb-6">
            Your consultation has been cancelled successfully. You&apos;ll receive a confirmation email shortly.
          </p>
          <p className="text-gray-600 mb-6">
            If you&apos;d like to reschedule, please feel free to reach out to us directly.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-tst-purple w-full sm:w-auto"
          >
            Return Home
          </Button>
        </div>
      </Section>
    );
  }

  if (!contact || !contact.scheduled_appointment_at) {
    return (
      <Section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center w-full max-w-md bg-white p-6 sm:p-8 rounded-xl border-2 border-black shadow-brutalistLg">
          <h1 className="text-2xl font-bold mb-4">No Appointment Found</h1>
          <p className="text-lg mb-6">This appointment may have already been cancelled or doesn&apos;t exist.</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-tst-purple w-full sm:w-auto"
          >
            Return Home
          </Button>
        </div>
      </Section>
    );
  }

  // CHANGED: Convert UTC to Eastern timezone before formatting
  const appointmentUtc = new Date(contact.scheduled_appointment_at);
  const appointmentEastern = toZonedTime(appointmentUtc, EASTERN_TIMEZONE);

  return (
    <Section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 text-center border-b-2 border-black">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-tst-purple" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cancel Appointment</h1>
            <p className="text-gray-600">
              We understand plans can change. You can cancel your consultation below.
            </p>
          </div>

          {/* Appointment Details */}
          <div className="p-6 sm:p-8">
            <div className="bg-gray-50 border-2 border-black rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Appointment Details
              </h2>

              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Client:</span>
                  <p className="text-lg font-semibold break-words">
                    {contact.name}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-lg break-all">{contact.email}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Date & Time:</span>
                  <p className="text-lg font-semibold text-tst-purple">
                    {/* CHANGED: Use Eastern timezone for formatting */}
                    {format(appointmentEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE })}
                  </p>
                  <p className="text-lg font-semibold text-tst-purple">
                    {/* CHANGED: Use Eastern timezone for formatting */}
                    {format(appointmentEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE })}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6 sm:mb-8">
              <h3 className="font-bold text-yellow-800 mb-2">⚠️ Please Note:</h3>
              <ul className="text-yellow-700 space-y-1 text-sm">
                <li>• Cancelling this appointment will remove it from both calendars</li>
                <li>• You&apos;ll receive a confirmation email once cancelled</li>
                <li>• To reschedule, please contact us directly</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                onClick={() => router.push('/')}
                className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black w-full order-2 sm:order-1"
              >
                Keep Appointment
              </Button>

              <Button
                onClick={handleCancel}
                disabled={processing}
                className="bg-red-500 hover:bg-red-600 text-white border-2 border-black w-full order-1 sm:order-2"
              >
                {processing ? 'Cancelling...' : 'Cancel Appointment'}
              </Button>
            </div>

            {/* Contact Info */}
            <div className="mt-6 sm:mt-8 text-center text-gray-600">
              <p className="text-sm">
                Need help or want to reschedule?
                <br />
                Email us at{' '}
                <a
                  href="mailto:care@toastedsesametherapy.com"
                  className="text-tst-purple font-medium hover:underline break-all"
                >
                  care@toastedsesametherapy.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
