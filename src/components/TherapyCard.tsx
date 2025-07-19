// src/components/TherapyCard.tsx

import React from "react";
import LottieAnimation from "./LottieAnimation";
import styles from "./TherapyCard.module.css";
import Link from "next/link";

interface TherapyCardProps {
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData: any;
}

const TherapyCard: React.FC<TherapyCardProps> = ({
  title,
  description,
  animationData,
}) => {
  return (
    <Link href="/services" className={styles.wrapper}>
      <div className={styles.shadow}></div>
      <div className={styles.card}>
        <div className="w-full bg-white aspect-video min-h-340 overflow-hidden">
          <LottieAnimation animationData={animationData} />
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p>{description}</p>
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
  );
};

export default TherapyCard;
