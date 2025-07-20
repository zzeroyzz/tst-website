"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy load the Lottie component for better performance.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieAnimationProps {
  // The component will now receive the path to the animation file.
  animationPath: string;
  className?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationPath,
  className = "",
}) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Fetch the animation data from the public path.
    fetch(animationPath)
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error("Error fetching animation:", error));
  }, [animationPath]);

  // Display a placeholder while the animation is loading.
  if (!animationData) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full"></div>
      </div>
    );
  }

  // Render the animation once the data has been fetched.
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
