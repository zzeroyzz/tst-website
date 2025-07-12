"use client";

import React from "react";
import styles from "./Timeline.module.css";

interface TimelineProps {
  isInView: boolean;
  isLastStep: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ isInView, isLastStep }) => {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.dot}
        style={{
          transform: isInView ? "scale(1)" : "scale(0)",
        }}
      />
      {!isLastStep && (
        <div className={styles.line_container}>
          <div
            className={styles.line_progress}
            style={{ height: isInView ? "100%" : "0%" }}
          />
        </div>
      )}
    </div>
  );
};

export default Timeline;
