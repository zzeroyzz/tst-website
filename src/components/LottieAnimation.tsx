"use client"; // This component uses client-side hooks

import React from "react";
import Lottie from "lottie-react";

interface LottieAnimationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData: any;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
}) => {
  return <Lottie animationData={animationData} loop={true} />;
};

export default LottieAnimation;
