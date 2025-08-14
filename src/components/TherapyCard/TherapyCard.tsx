"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LottiePlayer } from "@/components/LottiePlayer/LottiePlayer";
import styles from "./TherapyCard.module.css";
import { therapyCards } from "@/data/therapyCardData";

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
 * This component renders the entire "Therapy that actually gets you" section,
 * including the grid of four animated cards.
 */
const TherapyCard = () => {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {therapyCards.map((card) => (
        <motion.div key={card.title} variants={itemVariants}>
          <Link href="/therapy-services" className={styles.wrapper}>
            <div className={styles.shadow}></div>
            <div className={styles.card} id={card.id}>
              <div className="w-full bg-white aspect-video min-h-240 overflow-hidden flex items-center justify-center">
                <LottiePlayer
                  file={card.animationPath}
                  width={280}
                  height={280}
                  alt={card.altText}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>

                {/* Updated to use checkmark bullet points with better text wrapping */}
                <ul className="flex-grow space-y-2 mb-4">
                  {card.description.map((item, index) => (
                    <li key={index} className="text-md opacity-90 flex items-start">
                      <span className="text-green-500 mr-3 mt-1 flex-shrink-0">✓</span>
                      <span className="leading-relaxed hyphens-none break-words" style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-black hover:text-gray-700 transition-colors">
                    {card.ctaLinkText}
                  </span>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M5 12H19"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 5L19 12L12 19"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TherapyCard;
