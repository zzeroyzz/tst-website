'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ProfileImage from '@/components/ProfileImage/ProfileImage';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import { aboutPageContent } from '@/data/aboutData';
import { LottiePlayer } from '@/components/LottiePlayer/LottiePlayer';
import { toastyTidbitsAnimation } from '@/data/animations';
import { resourcesPageData } from '@/data/resourceData';
import type { Metadata } from 'next';
import Image from 'next/image';
import CTA from '@/components/CTA/CTA';
export const metadata: Metadata = {
  title: 'About Kay — Queer- and Asian-Owned Therapy Practice in Atlanta',
  description:
    'Meet Kay (she/they), a licensed therapist providing affirming, identity-centered care for queer, neurodivergent, and trauma-impacted clients across Georgia.',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

const AboutPageClient = () => {
  // State for the newsletter form
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: 'Newsletter Subscriber' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Something went wrong. Please try again.'
        );
      }

      toast.success("You're subscribed! Welcome to Toasty Tidbits.");
      setEmail(''); // Clear the input
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div className="grid lg:grid-cols-2 border-t-2 border-black">
        {/* Image Column */}
        <div className="hidden lg:flex items-center justify-center bg-tst-yellow p-8 h-screen sticky top-0">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/tst-logo-long.svg"
              alt="Kay, your favorite therapist"
              width={600}
              height={600}
            />
            <ProfileImage />
          </motion.div>
        </div>

        {/* Text Content Column */}
        <div className="p-8 md:p-16 lg:p-24 max-w-4xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            <motion.h1
              className="hidden md:text-5xl font-extrabold mb-8 leading-tight"
              variants={itemVariants}
            >
              {aboutPageContent.title}
            </motion.h1>

            {/* Mobile-Only Image */}
            <motion.div
              className="lg:hidden mb-12 flex flex-col justify-center items-center"
              variants={itemVariants}
            >
              <Image
                src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/tst-logo-long.svg"
                alt="Kay, your favorite therapist"
                width={400}
                height={400}
              />
              <ProfileImage />
            </motion.div>
           <motion.h1
              className="text-4xl text-center md:hidden font-extrabold mb-8 leading-tight"
              variants={itemVariants}
            >
              {aboutPageContent.title}
            </motion.h1>
            {/* Styled Paragraphs */}
            <div className="space-y-8">
              {aboutPageContent.paragraphs.map((text, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  {index === 0 && (
                    <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-purple rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        My Clients
                      </p>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-teal rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        Who I Am
                      </p>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-yellow rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        My Work
                      </p>
                    </div>
                  )}

                  {index === 3 && (
                    <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-green rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        My Space
                      </p>
                    </div>
                  )}

                  {index === 4 && (
                    <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-red rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        My Approach
                      </p>
                    </div>
                  )}

                  {index === 5 && (
                    <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-purple rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        My Values
                      </p>
                    </div>
                  )}
                  {index === 6 && (
                    <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-teal rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        Outside of Sessions
                      </p>
                    </div>
                  )}
                  {index === 7 && (
                    <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-yellow rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        Lets connect
                      </p>
                    </div>
                  )}

                  <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-black shadow-brutalistLg hover:shadow-brutalistXl transition-all duration-300 group-hover:transform group-hover:-translate-y-1">
                    <p className="text-center md:text-lefttext-lg md:text-xl leading-relaxed text-gray-800">
                      {text}
                    </p>

                      </div>

                </motion.div>
              ))}
            </div>
            <div className="mb-6">
                      <div className="w-12 h-1 bg-tst-yellow rounded-full mb-4"></div>
                      <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                        Lets connect
                      </p>
                    </div>
 <CTA/>

          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default AboutPageClient;
