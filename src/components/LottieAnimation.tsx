"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieAnimationProps {
  animationPath: string;
  className?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationPath,
  className = "",
}) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(animationPath)
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error("Error fetching animation:", error));
  }, [animationPath]);

  if (!animationData) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default LottieAnimation;
