"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import styles from "./HowItWorksStep.module.css";
import cardStyles from "./HowItWorksStep.module.css";
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
}

const HowItWorksStep: React.FC<HowItWorksStepProps> = ({
  step,
  index,
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const isEven = index % 2 === 0;

  const Card = () => (
    <div
      className={clsx(
        cardStyles.content_item,
        isInView && cardStyles.content_item_visible,
        cardStyles.card_wrapper,
        "w-full max-w-md"
      )}
    >
      <div className={cardStyles.card_shadow} />
      <div className={cardStyles.card}>
        <div className="text-6xl font-bold text-purple">{step.number}</div>
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
      <Image src={step.imageUrl} alt={step.imageAlt} width={350} height={350} />
    </div>
  );

  return (
    <div ref={ref} className={styles.step_wrapper}>
      <div className="md:hidden flex flex-col items-center gap-8">
        <Img />
        <Card />
      </div>

      <div className="hidden md:flex ">
        <div className={clsx("flex-1 flex items-center justify-center gap-8")}>
          {isEven ? <Img /> : <Card />}
        </div>

        <div className={styles.timeline}>
          {!step.isLastStep && (
            <motion.div
              className={styles.timeline_progress}
              style={{
                height: isInView ? '100%' : '0%', // Fallback to simple animation
              }}
            />
          )}
          <div
            className={styles.timeline_dot}
            style={{
              transform: isInView
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0)",
            }}
          />
        </div>

        <div className={clsx("flex-1 flex items-center justify-center ")}>
          {isEven ? <Card /> : <Img />}
        </div>
      </div>
    </div>
  );
};

export default HowItWorksStep;
