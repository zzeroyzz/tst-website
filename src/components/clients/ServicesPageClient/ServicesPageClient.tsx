'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Section from '@/components/Section/Section';
import Button from '@/components/Button/Button';
import FAQ from '@/components/FAQ/FAQ';
import ServiceOfferingCard from '@/components/Services/ServiceOfferingCard';
import FallingPills from '@/components/FallingPills/FallingPills';
import AnimatedImage from '@/components/AnimatedImage/AnimatedImage';
import CTACard from '@/components/CTA/CTA';

import {
  individualTherapyData,
  ourApproachData,
} from '@/data/servicesPageData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
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

const ServicesPageClient = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/book/trauma');
  };

  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <Section>
        <motion.div
          className="flex flex-col items-center gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-center max-w-4xl mx-auto flex flex-col gap-5 items-center px-4"
            variants={itemVariants}
          >
            <h1 className="text-4xl lg:text-6xl font-extrabold">
              Therapy That Fits You, As You Are Virtual Therapy Across Georgia
            </h1>
            <p className="text-lg">
              Explore our therapeutic approach and find the support that meets
              your unique needs.
            </p>
            <Button onClick={handleClick} className="bg-tst-yellow">
              Book a Free 15-min Consultation
            </Button>
          </motion.div>

          <motion.div
            className="w-full max-w-5xl mx-auto mt-10 px-4"
            variants={itemVariants}
          >
            <FallingPills />
          </motion.div>
        </motion.div>
      </Section>

      {/* Individual Therapy Section */}
      <Section>
        <div className="text-center mb-12 px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold">Individual Therapy</h2>
        </div>
        <div className="max-w-4xl mx-auto px-4">
          <ServiceOfferingCard service={individualTherapyData} />
        </div>
      </Section>

      {/* Our Approach Section */}
      <Section className="bg-tst-purple border-t-2 border-black overflow-hidden">
        <motion.div
          className="text-center mb-16 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-5xl font-extrabold">
            A Closer Look at Our Approach
          </h2>
        </motion.div>
        <motion.div
          className="max-w-6xl mx-auto flex flex-col gap-24 px-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {ourApproachData.map((item, index) => (
            <motion.div
              key={item.title}
              className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center w-full"
              variants={itemVariants}
            >
              <div
                className={`w-full flex justify-center ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}
              >
                <div className="max-w-md w-full aspect-square flex items-center justify-center">
                  <AnimatedImage
                    animationData={item.animationData}
                    alt={item.altText}
                  />
                </div>
              </div>
              <div
                className={`flex flex-col gap-4 min-w-0 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}
              >
                <h3 className="text-2xl lg:text-3xl font-bold break-words">
                  {item.title}
                </h3>
                <p className="break-words">{item.description}</p>
                <div className="mt-2">
                  <h4 className="font-bold mb-2">What this means for you:</h4>
                  <ul className="list-disc list-inside flex flex-col gap-1">
                    {item.benefits.map(benefit => (
                      <li key={benefit} className="break-words">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
          <CTACard />
        </motion.div>
      </Section>

      {/* FAQ Section */}
      <div id="faq-section" className="border-t-2 border-black">
        <Section className="bg-tst-teal">
          <FAQ />
        </Section>
      </div>
    </main>
  );
};

export default ServicesPageClient;
