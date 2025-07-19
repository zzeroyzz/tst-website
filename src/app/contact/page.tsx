// src/app/contact/page.tsx
"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import CircleIcon from "@/components/CircleIcon";
import therapyCardStyles from "@/components/TherapyCard.module.css"; // Renamed for clarity
import contactPageStyles from "@/components/ContactPage.module.css"; // Renamed for clarity

import {
  trustIndicators,
  benefitCards,
  heroContent,
  benefitsSection
} from "@/data/contactData";

// Animation variants for Framer Motion
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

const ContactPage = () => {
  return (
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
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight max-w-5xl mx-auto"
              >
                {heroContent.title}
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed"
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
                      altText={indicator.altText}
                    />
                    <span className="font-bold">{indicator.text}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="flex justify-center"
              >
                <div className="animate-bounce bg-black p-3 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="white" stroke="currentColor" viewBox="0 0 24 24">
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
        <Section className="bg-tst-yellow py-20 border-y-2 border-black">
          <motion.div
            className="text-center max-w-5xl mx-auto"
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
            <div className="grid md:grid-cols-3 gap-8">
              {benefitCards.map((card) => (
                <motion.div key={card.id} variants={itemVariants} className={therapyCardStyles.wrapper}>
                  <div className={therapyCardStyles.shadow}></div>
                  <div className={`${therapyCardStyles.card} p-8`}>
                    <div className={`${card.bgColor} p-6 rounded-xl w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-black shadow-brutalistMd`}>
                      <span className="text-3xl">{card.iconEmoji}</span>
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
        <Section className="bg-tst-teal">
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
            {/* The wrapper div has been removed from here */}
            <ContactForm isContactPage={true} />
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
