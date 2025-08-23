'use client';

import React, { useRef } from 'react';
import { motion, Variants, useInView } from 'framer-motion';
import Section from '@/components/Section/Section';
import FAQ from '@/components/FAQ/FAQ';
import { howFitFreeWorksSteps, stepSection } from '@/data/bookData';
import HowFitFreeWorksSteps from '@/components/HowFitFreeWorksSteps/HowFitFreeWorksSteps';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const AdditionalContent: React.FC = () => {
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

  return (
    <div className="lg:overflow-y-auto">
      {/* Hero Section */}

      {/* Benefits Section */}
      <Section className="bg-tst-yellow py-20 border-t-2 border-black">
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
            className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900"
          >
            {stepSection.title}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-700 mb-16 font-medium"
          >
            {stepSection.subtitle}
          </motion.p>
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
      </Section>
      <Section className="bg-tst-teal border-t-2 border-black">
        <FAQ />
      </Section>
    </div>
  );
};

export default AdditionalContent;
