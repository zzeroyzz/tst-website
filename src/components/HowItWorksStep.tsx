"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import styles from "./HowItWorksStep.module.css";
import clsx from "clsx";

interface HowItWorksStepProps {
  step: {
    number: string;
    title: string;
    description: string;
    imageUrl: string;
    imageAlt: string;
    isLastStep: boolean;
  };
  index: number;
  isLastStep: boolean;
  nextStepInView?: boolean;
}

const HowItWorksStep: React.FC<HowItWorksStepProps> = ({
  step,
  index,
  nextStepInView = false,
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const isEven = index % 2 === 0;

  const Card = () => (
    <div
      className={clsx(
        styles.content_item,
        isInView && styles.content_item_visible,
        styles.card_wrapper
      )}
      id={`step-${step.number}`} // Add step-specific ID
    >
      <div className={styles.card_shadow} />
      <div className={styles.card}>
        <div className={styles.number}>{step.number}</div>
        <h3 className="text-2xl font-bold mt-2">{step.title}</h3>
        <p className="mt-2">{step.description}</p>
      </div>
    </div>
  );

  const Img = () => (
    <div
      className={clsx(
        styles.content_item,
        isInView && styles.content_item_visible
      )}
    >
      <div className={styles.image_wrapper}>
        <Image
          src={step.imageUrl}
          alt={step.imageAlt}
          width={300}
          height={300}
          sizes="(max-width: 768px) 300px, 350px"
          style={{
            objectFit: "contain",
            width: "100%",
            height: "auto",
            maxHeight: "300px"
          }}
          priority={index === 0}
          // Add these for debugging
          onLoad={() => console.log(`Image ${index} loaded successfully`)}
          onError={(e) => console.error(`Image ${index} failed to load:`, e)}
        />
      </div>
    </div>
  );

  return (
    <div ref={ref} className={styles.step_wrapper}>
      <div className="md:hidden flex flex-col items-center gap-8">
        <Img />
        <Card />
      </div>

      <div className="hidden md:flex">
        <div className="flex-1 flex items-center justify-center gap-8">
          {isEven ? <Img /> : <Card />}
        </div>

        <div className={styles.timeline}>
          {!step.isLastStep && (
            <motion.div
              className={styles.timeline_progress}
              style={{
                height: nextStepInView ? '100%' : '0%',
              }}
            />
          )}
          <div
            className={clsx(
              styles.timeline_dot,
              isInView && styles.timeline_dot_visible
            )}
          />
        </div>

        <div className="flex-1 flex items-center justify-center">
          {isEven ? <Card /> : <Img />}
        </div>
      </div>
    </div>
  );
};

export default HowItWorksStep;
