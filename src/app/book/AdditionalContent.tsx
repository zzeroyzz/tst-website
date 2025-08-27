'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Section from '@/components/Section/Section';
import FAQ from '@/components/FAQ/FAQ';
import {
  generalBookingFaqs,
  affirmingBookingFaqs,
  neurodivergentBookingFaqs,
  traumaBookingFaqs
} from '@/data/bookingFaqData';
import {
  howFitFreeWorksSteps,
  stepSection,
  meetYourTherapistBook,
} from '@/data/bookData';
import { therapyFocusAreas } from '@/data/servicesPageData';
import HowFitFreeWorksSteps from '@/components/HowFitFreeWorksSteps/HowFitFreeWorksSteps';
import ProfileImage from '@/components/ProfileImage/ProfileImage';
import FocusAreaBanner from '@/components/FocusAreaBanner/FocusAreaBanner';
import TestimonialCardBooking from '@/components/TestimonialCardBooking/TestimonialCardBooking';
import { testimonials } from '@/data/bookData';
import Button from '@/components/Button/Button';
import Highlight from '@/components/Highlight/Highlight';
interface AdditionalContentProps {
  variant?: 'trauma' | 'affirming' | 'nd';
  pageUrl?: string;
}

const AdditionalContent: React.FC<AdditionalContentProps> = ({
  variant = 'trauma',
  pageUrl = '/book'
}) => {
  // Create individual refs for each step (copied exactly from HomePageClient)
  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Track which steps are in view using individual refs
  const step0InView = useInView(step0Ref, { once: true, amount: 0.5 });
  const step1InView = useInView(step1Ref, { once: true, amount: 0.5 });
  const step2InView = useInView(step2Ref, { once: true, amount: 0.5 });
  const step3InView = useInView(step3Ref, { once: true, amount: 0.5 });

  // Create array of step visibility states
  const stepInViewStates = [step0InView, step1InView, step2InView, step3InView];

  // Create array of refs for easy access in the map
  const stepRefs = [step0Ref, step1Ref, step2Ref, step3Ref];

  // Select FAQs based on variant
  const getFaqsForVariant = () => {
    const baseFaqs = generalBookingFaqs;
    switch (variant) {
      case 'affirming':
        return [...baseFaqs, ...affirmingBookingFaqs];
      case 'nd':
        return [...baseFaqs, ...neurodivergentBookingFaqs];
      case 'trauma':
      default:
        return [...baseFaqs, ...traumaBookingFaqs];
    }
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };
  return (
    <div className="lg:overflow-y-auto">
      {/* Hero Section */}
      <Section minHeight="400px">
        <motion.div
          className="grid md:grid-cols-2 gap-12 md:gap-16 items-center min-h-400"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
           <motion.h2
              className="text-4xl md:hidden font-extrabold text-center "
              variants={itemVariants}
            >
              {meetYourTherapistBook.title}
            </motion.h2>
          <div className="flex justify-center">
            <ProfileImage width={400} height={400} />
          </div>

          <motion.div
            className="flex flex-col gap-4"
            variants={containerVariants}
          >
            <motion.h2
              className="hidden md:block md:text-6xl font-extrabold"
              variants={itemVariants}
            >
              {meetYourTherapistBook.title}
            </motion.h2>
            {meetYourTherapistBook.paragraphs.map((text, index) => (
              <motion.p key={index} className="text-lg md:text-xl" variants={itemVariants}>
                {text}
              </motion.p>
            ))}
            <motion.div variants={itemVariants} className="relative">
              <div
                className="absolute left-0"
                style={{ marginLeft: '-22px' }}
              ></div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Focus Areas Banner */}
        <motion.div
          className="mt-20"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <FocusAreaBanner focusAreas={therapyFocusAreas} />
        </motion.div>
      </Section>
      {/* Benefits Section */}
      <Section className="py-20">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="max-w-4xl mx-auto px-4 mb-20">
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900"
            >
              {stepSection.title}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-700 mb-16 font-medium"
            >
              {stepSection.subtitleTop}
            </motion.p>
            <motion.h3 variants={itemVariants} className="text-xl text-gray-700 font-bold">
              {stepSection.subtitleBottom}
            </motion.h3>
          </div>
          <div className="flex flex-col min-h-1000">
            {howFitFreeWorksSteps.map((step, index) => {
              const currentRef = stepRefs[index];
              const nextStepInView =
                index < howFitFreeWorksSteps.length - 1
                  ? stepInViewStates[index + 1]
                  : false;

              return (
                <div key={index} ref={currentRef}>
                  <HowFitFreeWorksSteps
                    step={step}
                    index={index}
                    isLastStep={step.isLastStep}
                    nextStepInView={nextStepInView}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
        {/* Testimonials in horizontal row */}
        <Section>
  {/* Heading */}
  <div className="text-center space-y-2">
    {/* <h2 className="text-3xl md:text-5xl font-extrabold">
      What our clients say
    </h2> */}
     <p className="text-5xl lg:text-6xl font-bold text-center w-full">
            Over{' '}
            <Highlight color="#FFD666">
              200
            </Highlight>{' '}
           clients <br/> supported since 2018
          </p>
  </div>

  {/* Testimonials */}
  <div className="flex flex-col sm:flex-row gap-6 mt-10">
    {testimonials.map((testimonial, index) => (
      <motion.div
        key={index}
        variants={itemVariants}
        className="flex-1"
      >
        <TestimonialCardBooking
          quote={testimonial.quote}
          iconUrl={testimonial.iconUrl}
          bgColor={testimonial.bgColor}
          altText={testimonial.altText}
        />
      </motion.div>
    ))}
  </div>

  {/* Privacy note */}
  <div className="text-center mt-8">
    <p className="italic text-gray-600 text-sm md:text-base">
      Reflections paraphrased for privacy
    </p>
  </div>
    <Section>
      {/* Practice Mission */}
    </Section>
  {/* Booking CTA card */}
  <div className="max-w-4xl mx-auto mt-24 bg-white rounded-lg shadow-brutalistLg border-2 border-black p-8">
    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
      Pick a time → Quick intake → Free consult.
    </h2>
    <h3 className="text-lg mb-8 text-center">
      First full session guaranteed, no charge if you choose not to move forward.
    </h3>
    <div className="flex justify-center">
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="bg-tst-purple"
      >
        Return to booking your 15-min consult
      </Button>
    </div>
  </div>
</Section>
      </Section>
      <Section>
        <FAQ
          customFaqs={getFaqsForVariant()}
          pageUrl={pageUrl}
          className="py-8"
        />
      </Section>
    </div>
  );
};

export default AdditionalContent;
