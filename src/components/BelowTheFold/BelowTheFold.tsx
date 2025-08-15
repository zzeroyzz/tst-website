"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./BelowTheFold.module.css";
import { symptomCards, heroContent } from "@/data/belowTheFoldData";
import Button from "@/components/Button/Button";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Animation variants for a staggered reveal effect
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

/**
 * This component renders the symptom cards section
 * using the same styling as therapy cards but with symptom-focused content
 */
const BelowTheFold = () => {
  const router = useRouter();

  return (
    <>
      <h2 className="text-5xl font-extrabold mb-6 text-center">
        {heroContent.headline.title}
      </h2>
      <h3 className="text-xl mb-12 text-center">
        {heroContent.headline.subtitle}
      </h3>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {symptomCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <div className={styles.wrapper}>
              <div className={styles.shadow}></div>
              <div className={`${styles.card}`} id={card.id}>
                <div className="p-6 flex flex-col h-full">
                  {/* Header section with emoji and title */}
                  <div className="mb-6 flex flex-col items-center">                    <h3 className="text-3xl font-bold text-center">{card.title}</h3>

                  <Image src={card.imageLink} alt={card.imageAlt} width={100} height={100} />

                  </div>

                  {/* Tags for this specific card */}
                  <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {card.tags.map((tag, index) => (
                      <div
                        key={index}
                        className={`${card.tagBgColor || 'bg-tst-cream'} text-sm font-medium px-3 py-1 rounded-full border-2 border-black shadow-brutalist`}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>

                  {/* Symptoms list - takes remaining space */}
                  <ul className="flex-grow space-y-3">
                    {card.symptoms.map((symptom, index) => (
                      <li key={index} className="text-lg opacity-90 flex items-start">
                        <span className="text-tst-purple mr-3 mt-1 flex-shrink-0">→</span>
                        <span className="leading-relaxed">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* CTA Card */}
        <div className="lg:col-span-3 mt-16">
          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-brutalist border-2 border-black">
            <h2 className="text-3xl font-bold mb-4 text-center">{heroContent.cta.title}</h2>
            <h3 className="text-lg mb-8 text-center">
              {heroContent.headline.subtitle}
            </h3>
            <div className="text-center">
              <Button
                onClick={() => router.push(`${heroContent.cta.buttonLink}`)}
                className="bg-tst-purple w-full sm:w-auto"
              >
                {heroContent.cta.buttonText}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default BelowTheFold;
