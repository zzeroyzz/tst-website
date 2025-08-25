import React from 'react';
import type { Metadata } from 'next';
import Section from '@/components/Section/Section';
import Button from '@/components/Button/Button';
import { CheckCircle, Calendar, Clock, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Appointment Rescheduled - Thank You | Toasted Sesame Therapy',
  description: 'Your appointment has been successfully rescheduled. Check your email for updated confirmation details.',
  robots: 'noindex, nofollow',
};

export default function ThankYouReschedulePage() {
  return (
    <Section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg overflow-hidden text-center">
          {/* Header */}
          <div className="p-8 border-b-2 border-black bg-tst-teal">

            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-white" />
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Appointment Rescheduled!
            </h1>
            <p className="text-white/90 text-sm md:text-lg">
              Your consultation has been moved to your new preferred time.
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-6">
              <div className="bg-gray-50 border-2 border-black rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5 text-tst-teal" />
                  What Happens Next
                </h2>
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-24 h-6 md:w-12 md:h-8  bg-tst-teal text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Check Your Email</p>
                      <p className="text-gray-600">You'll receive an updated confirmation with your new appointment time and secure video link.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-6 md:w-10 md:h-8 bg-tst-teal text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Updated Calendar Invite</p>
                      <p className="text-gray-600">Your calendar event will be automatically updated with the new date and time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-6 md:w-10 md:h-8  bg-tst-teal text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Join Your Consultation</p>
                      <p className="text-gray-600">Use the secure video link in your confirmation email to join at the new time.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-tst-cream border-2 border-black rounded-lg p-6">
                <h3 className="font-bold mb-2 flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-tst-teal" />
                  Important Reminders
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Your rescheduled consultation is still completely free</li>
                  <li>• You'll meet via the same secure video link (updated time only)</li>
                  <li>• If you need to make another change, use the link in your new confirmation email</li>
                  <li>
  • Questions? Email us at{" "}
  <a
    href="mailto:care@toastedsesametherapy.com"
    className="text-tst-purple font-medium hover:underline"
  >
    care@toastedsesametherapy.com
  </a>
</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">

                <Link href="/therapy-services" className="flex-1">
                  <Button className="w-full bg-tst-teal hover:bg-teal-600 text-white border-2 border-black">
                    Learn More About Our Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
