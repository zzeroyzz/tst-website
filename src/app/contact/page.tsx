"use client";

import React from "react";
import { motion } from "framer-motion";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import Image from "next/image";

// Animation variants for Framer Motion
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const ContactPage = () => {
  return (
    <main>
      {/* 1. Main Contact Section */}
      <Section>
        <motion.div
          className="flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={itemVariants}
        >
          {/* Headline at the top */}
          <h1 className="text-5xl font-extrabold text-center max-w-3xl mx-auto">
            Taking the first step is the hardest part.
          </h1>
      <p className="text-lg mt-8">
                You&apos;re in the right place. Fill out the form, and I’ll get back to you personally to schedule our free, no-pressure consultation.
              </p>
          {/* Two-column grid below the headline */}
          <div className="grid lg:grid-cols-2 gap-16 items-start w-full max-w-6xl mx-auto mt-16">

            {/* Left Column: Image and Subheader */}
            <div className="flex flex-col gap-8 items-center lg:items-start text-center lg:text-left">
              <div className="relative w-full max-w-md">
                <Image
                  src="/assets/step_3.png"
                  alt="Illustration of a character in a therapy session"
                  width={500}
                  height={300}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              {/* Added top margin here for better spacing */}

            </div>

            {/* Right Column: The Contact Form */}
            <div className="w-full">
              <ContactForm isContactPage={true} />
            </div>
          </div>
        </motion.div>
      </Section>

      {/* 2. FAQ Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={itemVariants}
      >
        <div className="border-t-2 border-black">
          <Section className="bg-tst-teal">
            <FAQ />
          </Section>
        </div>
      </motion.div>
    </main>
  );
};

export default ContactPage;
