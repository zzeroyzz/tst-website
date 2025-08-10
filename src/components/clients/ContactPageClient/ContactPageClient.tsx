// src/components/clients/ContactPageClient/ContactPageClient.tsx
"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Section from "@/components/Section/Section";
import ContactForm from "@/components/Contact/ContactForm";
import FAQ from "@/components/FAQ/FAQ";
import Image from "next/image";
import CircleIcon from "@/components/CircleIcon/CircleIcon";
import therapyCardStyles from "@/components/TherapyCard/TherapyCard.module.css";
import contactPageStyles from "@/components/Contact/modules/ContactForm.module.css";

import {
  trustIndicators,
  benefitCards,
  heroContent,
  benefitsSection
} from "@/data/contactData";

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

// Rename this function
const ContactPageClient = () => {
  return (
    // The main JSX from your old page file goes here
    <main className={`lg:grid lg:grid-cols-2 border-t-2 border-black ${contactPageStyles.animatedItem}`}>
      {/* --- Left Scrolling Column --- */}
      <div className="lg:overflow-y-auto lg:h-screen">
        {/* Hero Section */}
        <Section className="bg-tst-cream">
          <motion.div
            className="w-full"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Hero Content */}
            <div className="text-center">
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 leading-tight max-w-5xl mx-auto"
              >
                {heroContent.title}
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl md:text-4xl lg:text-2xl font-semibold leading-tight max-w-5xl mx-auto"
              >
                {heroContent.title2}
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-md md:text-xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                {heroContent.subtitle}
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-base text-gray-700 mb-16"
              >
                {trustIndicators.map((indicator) => (
                  <div key={indicator.id} className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border-2 border-black shadow-brutalist">
                    <CircleIcon
                      size="xs"
                      bgColor="bg-green-500"
                      iconUrl={indicator.iconUrl}

                    />
                    <span className="font-bold">{indicator.text}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <div className="animate-bounce bg-white p-3 rounded-lg shadow-brutalist border-2 border-black">
                  <svg className="w-6 h-6 text-black" fill="white" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>
          {/* --- Mobile-Only Contact Form --- */}
        <div className="lg:hidden">
          <Section className="bg-tst-cream">
                <ContactForm />
          </Section>
        </div>
        </Section>

        {/* Benefits Section */}
        <Section className="bg-tst-yellow py-20 border-t-2 border-black">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900"
            >
              {benefitsSection.title}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-700 mb-16 max-w-3xl mx-auto font-medium"
            >
              {benefitsSection.subtitle}
            </motion.p>
            <div className="flex flex-col gap-8">
              {benefitCards.map((card) => (
                <motion.div key={card.id} variants={itemVariants} className={`${therapyCardStyles.wrapper} max-w-md mx-auto w-full`}>
                  <div className={therapyCardStyles.shadow}></div>
                  <div className={`${therapyCardStyles.card} p-8 text-center min-h-[280px] flex flex-col justify-center`}>
                    <div className={`${card.bgColor} p-4 rounded-xl w-[100px] h-[100px] mx-auto mb-6 flex items-center justify-center border-2 border-black shadow-brutalistMd`}>
                       <Image
                        src={card.icon}
                        alt={card.alt}
                        width={64}
                        height={64}
                        className="object-contain"

                      />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                    <p className="text-gray-700 leading-relaxed font-medium">{card.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Section>

        {/* FAQ Section */}
        <Section className="bg-tst-teal border-t-2 border-black">
          <FAQ />
        </Section>
      </div>

      {/* --- Right Sticky Column (Desktop-Only) --- */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen bg-tst-cream border-l-2 border-black">
        <div className="flex items-center justify-center h-full p-12">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ContactForm isContactPage={true} />
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ContactPageClient;
