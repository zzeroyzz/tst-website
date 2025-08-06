"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ProfileImage from '@/components/ProfileImage/ProfileImage';
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { aboutPageContent } from '@/data/aboutData';
import { LottiePlayer } from '@/components/LottiePlayer/LottiePlayer';
import { toastyTidbitsAnimation } from "@/data/animations";
import { resourcesPageData } from "@/data/resourceData";
import type { Metadata } from 'next';
import Image from "next/image";

export const metadata: Metadata = {
  title: 'About Kay | Toasted Sesame Therapy',
  description: 'Meet Kay (she/they), a Korean American, queer, and neurodivergent therapist dedicated to providing identity-centered care.'
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
    transition: { duration: 0.6 }
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
        throw new Error(errorData.error || 'Something went wrong. Please try again.');
      }

      toast.success("You're subscribed! Welcome to Toasty Tidbits.");
      setEmail(''); // Clear the input

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
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
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight"
                        variants={itemVariants}
                    >
                      {aboutPageContent.title}
                    </motion.h1>

                    {/* Mobile-Only Image */}
                    <motion.div className="lg:hidden mb-12 flex flex-col justify-center items-center" variants={itemVariants}>
                        <Image
                          src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/tst-logo-long.svg"
                          alt="Kay, your favorite therapist"
                          width={400}
                          height={400}
                        />
                        <ProfileImage />
                    </motion.div>

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
                              <p className="text-lg md:text-xl leading-relaxed text-gray-800">
                                  {text}
                              </p>

                              {index === 7 && (
                                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                  <h3 className="text-2xl font-bold mb-4">Ready to start your journey?</h3>
                                  <p className="text-lg mb-6">I&apos;d love to hear from you and see how we can work together.</p>
                                  <Button className="bg-tst-green text-white px-8 py-4 rounded-lg font-bold"  onClick={() => router.push('/contact')}>
                                    Get In Touch
                                  </Button>
                                </div>
                              )}
                            </div>

                          </motion.div>
                        ))}
                    </div>

                    {/* Newsletter Signup Section */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-16"
                    >
                        <div className="mb-6">
                            <div className="w-12 h-1 bg-tst-yellow rounded-full mb-4"></div>
                            <p className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">
                                Stay Connected
                            </p>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-black shadow-brutalistLg">
                            <div className="text-center mb-6">
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <div className="w-24 h-24 mb-2">
                                        <LottiePlayer
                                            file={toastyTidbitsAnimation}
                                            width={100}
                                            height={100}
                                            alt=""
                                        />
                                    </div>
                                    <h1 className="text-black font-black text-4xl md:text-4xl lg:text-5xl text-center leading-none -mt-2">
                                        toasty<br/>tidbits
                                    </h1>
                                </div>
                                <p className="text-lg mb-6 max-w-2xl mx-auto">
                                    Join hundreds of readers who get my weekly newsletter, <strong>Toasty Tidbits</strong> —
                                    bite-sized insights on mental health, healing, and finding joy in the everyday mess of being human.
                                </p>
                            </div>

                            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4">
                                <Input
                                    type="email"
                                    placeholder="Your email address"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    wrapperClassName="w-full"
                                />
                                <Button type="submit" className="bg-tst-purple" disabled={isSubmitting}>
                                    {isSubmitting ? 'Subscribing...' : 'Subscribe to Toasty Tidbits'}
                                </Button>
                            </form>

                            <p className="text-sm text-gray-600 mt-4 text-center">
                                Free weekly insights • No spam • Unsubscribe anytime
                            </p>
                             <p className="text-xs text-gray-600 mt-2">
                              {resourcesPageData.hero.privacyNotice.split('privacy policy')[0]}
                              <a href={resourcesPageData.routes.privacyPolicy} className="underline">
                                privacy policy
                              </a>
                              {resourcesPageData.hero.privacyNotice.split('privacy policy')[1]}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    </main>
  );
};

export default AboutPageClient;
