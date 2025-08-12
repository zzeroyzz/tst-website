// Update src/components/Contact/ContactForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import Button from "@/components/Button/Button";
import FAQ from "@/components/FAQ/FAQ";
import Input from "@/components/Input/Input";

interface ContactFormProps {
  isContactPage?: boolean;
  id?: string;
}

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
};

const ContactForm: React.FC<ContactFormProps> = ({ isContactPage = false }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactExists, setContactExists] = useState(false);
  const { width, height } = useWindowSize();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
    if (contactExists) setContactExists(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setContactExists(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate contact error (409 status)
        if (response.status === 409 && data.contactExists) {
          setContactExists(true);
          setError(data.error);
          return;
        }

        // Handle other errors
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // Track the lead generation
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "generate_lead_form_start",
        page_source: isContactPage ? "contact" : "homepage",
        form_location: window.location.pathname,
        form_type: isContactPage ? "contact" : "homepage",
      });

      // Redirect to questionnaire
      if (data.questionnaireToken) {
        window.location.href = `/questionnaire/${data.questionnaireToken}`;
        return;
      }

      // Fallback to success state if no token (shouldn't happen)
      setIsSubmitted(true);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPostSubmitContent = () => {
    return (
      <div className="space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-6">Thank You!</h2>
          <h3 className="text-3xl font-bold mb-4">Here&apos;s what to expect next:</h3>
          <ul className="list-disc list-inside space-y-3 text-lg text-left">
            <li>You&apos;ll receive a personal email from me within 1-2 business days.</li>
            <li>In the email, I&apos;ll provide a link to schedule your free 15-minute video consultation.</li>
            <li>We&apos;ll use that time to chat, see if it&apos;s a good fit, and answer any questions you have.</li>
          </ul>
        </div>

        {!isContactPage && (
          <div className="mt-16">
            <FAQ />
          </div>
        )}
      </div>
    );
  };
const handleEmailClick = () => {
  window.location.href = `mailto:hello@example.com?subject=${encodeURIComponent(
    "Follow-up on My Therapy Inquiry"
  )}&body=${encodeURIComponent(
    "Hi Kay,\n\nI’ve connected with you before and would like to follow up regarding scheduling or questions I have about starting therapy.\n\nMy details are:\n• Name:\n• Best contact number:\n• Preferred availability:\n• What I am interested in working on in therapy:\n• My budget:\n• My location (city/state):\n\nThank you, and I look forward to hearing from you.\n\nBest,\n[Your Name]"
  )}`;
};
  const renderContactExistsMessage = () => {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">👋</div>
        <h3 className="text-2xl font-bold mb-4 text-yellow-800">We&apos;ve connected before!</h3>
        <p className="text-lg text-yellow-700 mb-6">
          It looks like we already have your information in our system. For personalized assistance with scheduling or any questions, please reach out directly.
        </p>
        <div className="space-y-4">

            <Button onClick={handleEmailClick} className=" bg-tst-purple text-black">Contact Us</Button>

          <p className="text-sm text-yellow-600">
            We&apos;ll get back to you within 1 business day
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-white p-12 rounded-xl border-2 border-black shadow-brutalistLg max-w-5xl mx-auto">
      {isSubmitted && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={8000}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      {isSubmitted ? (
        renderPostSubmitContent()
      ) : contactExists ? (
        renderContactExistsMessage()
      ) : (
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-10">
            Reach out to start therapy.
          </h2>

          <form id="contact-form" onSubmit={handleSubmit}>
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
                <Button type="submit" className="bg-tst-yellow py-3" wrapperClassName="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Next →'}
                </Button>
              </div>
              {error && !contactExists && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
