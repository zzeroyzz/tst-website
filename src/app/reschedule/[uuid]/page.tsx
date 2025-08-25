/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/reschedule/[uuid]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Section from '@/components/Section/Section';
import { Calendar, Clock, X } from 'lucide-react';
import { format, toZonedTime } from 'date-fns-tz';
import AppointmentRescheduleCalendar from '@/components/AppointmentRescheduleCalendar/AppointmentRescheduleCalendar';
import toast from 'react-hot-toast';

const EASTERN_TIMEZONE = 'America/New_York';

interface Contact {
  id: string;
  uuid?: string;
  name: string;
  last_name?: string;
  email: string;
  scheduled_appointment_at: string | null;
  appointment_status: string | null;
}

export default function ReschedulePage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointment/cancel-link/${uuid}`, { cache: 'no-store' });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Appointment not found');
          return;
        }
        setContact(data.contact as Contact);
      } catch (err) {
        setError('Failed to load appointment details');
        console.error('Error fetching appointment:', err);
      } finally {
        setLoading(false);
      }
    };

    if (uuid) fetchAppointment();
  }, [uuid]);

  const handleReschedule = async (contactId: string | number, newDateTime: Date) => {
    try {
      const res = await fetch('/api/appointment/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: uuid, // Use UUID instead of contactId
          newDateTime: newDateTime.toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reschedule appointment');
      }

      toast.success('Appointment rescheduled successfully!');
      // Redirect to thank you page for reschedule
      router.push('/thank-you-reschedule');
    } catch (error: any) {
      console.error('Reschedule error:', error);
      toast.error(error.message || 'Failed to reschedule appointment');
      throw error; // Re-throw to let the calendar component handle it
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
          <button
            onClick={() => router.push('/')}
            className="bg-tst-purple  text-white px-6 py-2 rounded-lg border-2 border-black shadow-brutalistSm hover:shadow-brutalist transition-all"
          >
            Return Home
          </button>
        </div>
      </Section>
    );
  }

  if (!contact || !contact.scheduled_appointment_at) {
    return (
      <Section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center w-full max-w-md bg-white p-6 sm:p-8 rounded-xl border-2 border-black shadow-brutalistLg">
          <h1 className="text-2xl font-bold mb-4">No Appointment Found</h1>
          <p className="text-lg mb-6">This appointment may have been cancelled or doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-tst-purple  text-white px-6 py-2 rounded-lg border-2 border-black shadow-brutalistSm hover:shadow-brutalist transition-all"
          >
            Return Home
          </button>
        </div>
      </Section>
    );
  }

  const appointmentUtc = new Date(contact.scheduled_appointment_at);
  const appointmentEastern = toZonedTime(appointmentUtc, EASTERN_TIMEZONE);

  return (
    <Section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg overflow-hidden">
          <div className="p-6 sm:p-8 text-center border-b-2 border-black">
            <Calendar className="w-8 h-8 mx-auto mb-4 text-tst-purple" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Reschedule Appointment</h1>
            <p className="text-gray-600">Choose a new time that works better for you.</p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="bg-gray-50 border-2 border-black rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Current Appointment
              </h2>

              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Client:</span>
                  <p className="text-lg font-semibold break-words">{contact.name}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-lg break-all">{contact.email}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-600">Current Date & Time:</span>
                  <p className="text-lg font-semibold text-tst-purple">
                    {format(appointmentEastern, 'EEEE, MMMM d, yyyy', { timeZone: EASTERN_TIMEZONE })}
                  </p>
                  <p className="text-lg font-semibold text-tst-purple">
                    {format(appointmentEastern, 'h:mm a zzz', { timeZone: EASTERN_TIMEZONE })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowCalendar(true)}
                className="bg-tst-purple  text-white px-6 py-3 rounded-lg border-2 border-black shadow-brutalistSm hover:shadow-brutalist transition-all font-medium"
              >
                Choose New Time
              </button>

              <button
                onClick={() => router.push(`/cancel-appointment/${uuid}`)}
                className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-3 rounded-lg border-2 border-black shadow-brutalistSm hover:shadow-brutalist transition-all font-medium"
              >
                Back to Cancel Options
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Calendar Modal */}
      {showCalendar && (
        <AppointmentRescheduleCalendar
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          contactId={contact.id}
          contactUuid={uuid} // Pass UUID to calendar
          contactName={contact.name}
          contactEmail={contact.email}
          currentAppointmentDate={appointmentUtc}
          onReschedule={handleReschedule}
        />
      )}
    </Section>
  );
}
