"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LottiePlayer } from "./LottiePlayer";
import styles from "./TherapyCard.module.css";
import { therapyCards } from "@/data/pageData";

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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-575"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {therapyCards.map((card) => (
        <motion.div key={card.title} variants={itemVariants}>
          <Link href="/therapy-services" className={styles.wrapper}>
            <div className={styles.shadow}></div>
            <div className={styles.card}>
              <div className="w-full bg-white aspect-video min-h-340 overflow-hidden flex items-center justify-center">
                <LottiePlayer
                  file={card.animationPath}
                  width={280}
                  height={280}
                  alt={card.altText}
                />
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                <p>{card.description}</p>
                <div className="flex-grow" />
                <div className="flex justify-end mt-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
