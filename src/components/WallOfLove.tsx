"use client";
import React from "react";
import { wallOfLoveData } from "@/data/wallOfLoveData";
import WallOfLoveCard from "./WallOfLoveCard";
import styles from "./WallOfLove.module.css";

const WallOfLove = () => {
  const repeatedData = [...wallOfLoveData, ...wallOfLoveData];
  return (
    <div className="flex flex-col items-center gap-16">
      <div className={styles.scroller}>
        <div className={styles.scroller_inner}>
          {repeatedData.map((testimonial, index) => (
            <WallOfLoveCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WallOfLove;
