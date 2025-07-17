/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Input from './Input';
import Button from './Button';
import toast from 'react-hot-toast';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email.');
      return;
    }
    setIsSubmitting(true);
    try {
      // We can reuse the /api/contact endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: 'Newsletter Subscriber' }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.');
      }
      toast.success('Thanks for subscribing!');
      setIsSubmitted(true);
      // Close the modal automatically after a short delay
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex justify-center items-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="relative bg-tst-cream border-2 border-black rounded-lg shadow-brutalistLg w-full max-w-md p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute p-2 text-xl font-bold hover:text-red-500 transition-colors z-10 "
              style={{ top: '12px', right: '12px' }}
            >
              &times;
            </button>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center h-48 mt-12">
                <h2 className="text-3xl font-extrabold mb-4">You&#39;re In!</h2>
                <p>Thanks for subscribing. Keep an eye on your inbox for our next newsletter.</p>
              </div>
            ) : (
              <div className="mt-12">
                <Image
                  src="/assets/hero-image.png"
                  alt="Newsletter illustration"
                  width={150}
                  height={150}
                  className="mx-auto mb-4"
                />
                <h2 className="text-3xl font-extrabold mb-4">Enjoying the content?</h2>
                <p className="text-lg mb-6">
                  Get our latest posts, free guides, and reflections sent straight to your inbox.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    type="email"
                    placeholder="Your best email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="bg-tst-purple" disabled={isSubmitting}>
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscribeModal;
