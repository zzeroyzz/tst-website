"use client";

import React, { useState, useEffect } from "react";
import Button from "./Button";
import FAQ from "./FAQ"; // Keep FAQ for the default case
import styles from "./ContactForm.module.css";
import Confetti from "react-confetti";

interface ContactFormProps {
  isContactPage?: boolean; // The new conditional prop
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { width, height } = useWindowSize();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const renderPostSubmitContent = () => {
    if (isContactPage) {
      // If on the contact page, show "What to expect next"
      return (
        <div className="text-center max-w-2xl mx-auto">
           <h2 className="text-4xl font-extrabold mb-6">Thank You!</h2>
            <h3 className="text-3xl font-bold mb-4">Here's what to expect next:</h3>
            <ul className="list-disc list-inside space-y-3 text-lg text-left">
              <li>You’ll receive a personal email from me within 1-2 business days.</li>
              <li>In the email, I’ll provide a link to schedule your free 15-minute video consultation.</li>
              <li>We’ll use that time to chat, see if it’s a good fit, and answer any questions you have.</li>
            </ul>
        </div>
      );
    }
    // Otherwise, show the FAQ (default behavior for the homepage)
    return <FAQ />;
  };

  return (
    <div id="contact-form" className="relative">
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
      ) : (
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-8">
            Reach out to start therapy.
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className={styles.input_wrapper}>
                <label htmlFor="name" className="sr-only">Your name</label>
                <div className={styles.shadow} />
                <input type="text" id="name" name="name" placeholder="Your name" className={styles.input} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.input_wrapper}>
                  <label htmlFor="phone" className="sr-only">Phone number</label>
                  <div className={styles.shadow} />
                  <input type="tel" id="phone" name="phone" placeholder="Phone number" className={styles.input} />
                </div>
                <div className={styles.input_wrapper}>
                  <label htmlFor="email" className="sr-only">Your email</label>
                  <div className={styles.shadow} />
                  <input type="email" id="email" name="email" placeholder="Your email" className={styles.input} />
                </div>
              </div>
              <div className="mt-2">
                <Button type="submit" className="bg-tst-yellow" wrapperClassName="w-full">
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
