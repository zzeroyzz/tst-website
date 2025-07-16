"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Section from "@/components/Section";
import TestimonialCard from "@/components/TestimonialCard";
import Image from "next/image";
import Button from "@/components/Button";
import CircleIcon from "@/components/CircleIcon";
import AnimatedCheckbox from "@/components/AnimatedCheckbox";
import LottieAnimation from "@/components/LottieAnimation";
import ProfileImage from "@/components/ProfileImage";
import TherapyCard from "@/components/TherapyCard";
import HowItWorksStep from "@/components/HowItWorksStep";
import HoverLink from '@/components/HoverLink';
import { tiredAnimation } from "@/data/animations";
import {
  socialProofIcons,
  testimonials,
  checklistItems,
  therapyCards,
  meetYourTherapist,
  howItWorksSteps,
} from "@/data/pageData";
import ContactForm from "@/components/ContactForm";
import LeadMagnet from "@/components/LeadMagnet";

// Animation variants
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const heroItemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 },
  },
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

export default function HomePage() {
  const howItWorksRef = useRef(null);

  const handleScroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      contactForm.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <main>
      <Section className="pb-32" minHeight="100vh">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center min-h-500"
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="flex flex-col gap-4"
            variants={heroContainerVariants}
          >
            <motion.h1
              className="text-5xl lg:text-6xl font-extrabold leading-tight"
              variants={heroItemVariants}
            >
              For the deep feelers, drained hearts, and healing seekers.
            </motion.h1>
            <motion.p className="text-lg" variants={heroItemVariants}>
              You’ve carried too much for too long. It’s time to finally care
              for you.
            </motion.p>

            <motion.div
              className="flex flex-col md:flex-row flex-wrap gap-4 pt-4"
              variants={heroItemVariants}
            >
              <Button onClick={handleScroll} className="bg-tst-yellow">
                Book a call
              </Button>
              <Button className="bg-white">Download Free Therapy Guide</Button>
            </motion.div>

            <motion.div
              className="pt-6 flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-4"
              variants={heroItemVariants}
            >
              <div className="flex flex-shrink-0">
                {socialProofIcons.map((icon, index) => (
                  <CircleIcon
                    key={index}
                    size="sm"
                    bgColor={icon.bgColor}
                    iconUrl={icon.iconUrl}
                    altText={icon.altText}
                    wrapperClassName={icon.className}
                  />
                ))}
              </div>
              <p className="text-sm font-medium">
                <strong>More than 200+ people</strong> have taken the first
                step.
                <br />
                You’re not alone.
              </p>
            </motion.div>
            {/* ----- END OF CORRECTION ----- */}
          </motion.div>

          <motion.div
            className="flex items-center justify-center"
            variants={heroItemVariants}
          >
            <Image
              src="/assets/hero-image.png"
              alt="Therapy illustration with a lucky cat"
              width={500}
              height={500}
              className="w-full h-auto max-w-md mx-auto"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-8 mt-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <TestimonialCard
                quote={testimonial.quote}
                iconUrl={testimonial.iconUrl}
                bgColor={testimonial.bgColor}
              />
            </motion.div>
          ))}
        </motion.div>
        <motion.p
          className="text-center italic mt-16 max-w-2xl mx-auto"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          Each reflection is based on real things clients have shared,
          thoughtfully paraphrased to honor both their meaning and their
          privacy.
        </motion.p>
      </Section>

      <motion.div
        className="border-t-2 border-black"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
      <Section className="bg-tst-yellow" minHeight="750px">
  <div className="bg-white border-2 border-black rounded-xl shadow-brutalistLg p-8 md:p-12">
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="flex flex-col gap-6">
        <h2 className="text-4xl md:text-5xl font-extrabold">
          Check all that sound like you.
        </h2>
        {/* MODIFIED animation below */}
        <div className="block md:hidden w-56 mx-auto aspect-square">
          <LottieAnimation animationData={tiredAnimation} />
        </div>
        <div className="flex flex-col gap-4">
          {checklistItems.map((item, index) => (
            <AnimatedCheckbox key={index} label={item} />
          ))}
        </div>
        <div className="pt-4">
          <Button onClick={handleScroll} className="bg-tst-purple">
            Get Started
          </Button>
        </div>
      </div>

      {/* This is the existing animation that ONLY shows on desktop */}
      <div className="hidden md:block max-w-sm mx-auto aspect-square">
        <LottieAnimation animationData={tiredAnimation} />
      </div>
    </div>
  </div>
</Section>
      </motion.div>

      <div className="border-t-2 border-black">
        <LeadMagnet />
      </div>

      <motion.div
        className="border-t-2 border-black"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Section className="bg-tst-purple" minHeight="1000px">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-extrabold">
              Therapy that actually gets you
            </h2>
          </div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-575"
            variants={containerVariants}
          >
            {therapyCards.map((card, index) => (
              <motion.div key={index} variants={itemVariants}>
                <TherapyCard
                  title={card.title}
                  description={card.description}
                  animationData={card.animationData}
                />
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Section minHeight="400px">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center min-h-400">
            <div className="flex justify-center">
              <ProfileImage />
            </div>

            <motion.div
              className="flex flex-col gap-4"
              variants={containerVariants}
            >
              <motion.h2
                className="text-5xl font-extrabold"
                variants={itemVariants}
              >
                {meetYourTherapist.title}
              </motion.h2>
              {meetYourTherapist.paragraphs.map((text, index) => (
                <motion.p
                  key={index}
                  className="text-lg"
                  variants={itemVariants}
                >
                  {text}
                </motion.p>
              ))}
               <motion.div variants={itemVariants} className="flex justify-end">
                  <HoverLink href="/about" className="group gap-2 font-bold text-lg text-tst-purple">
                    <span>Read my full bio</span>

                  </HoverLink>
              </motion.div>
            </motion.div>
          </div>
        </Section>
      </motion.div>

      <div ref={howItWorksRef}>
        <Section minHeight="1000px">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-6xl font-extrabold">
              What working together looks like
            </h2>
          </motion.div>
          <div className="flex flex-col min-h-1000">
            {howItWorksSteps.map((step, index) => (
              <HowItWorksStep
                key={index}
                step={step}
                index={index}
                isLastStep={step.isLastStep}
              />
            ))}
          </div>
        </Section>
      </div>

      <Section>
        <ContactForm />
      </Section>
    </main>
  );
}
