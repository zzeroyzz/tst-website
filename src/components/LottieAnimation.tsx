"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Lazy load the Lottie component
const Lottie = dynamic(() => import("lottie-react"), {
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  ),
  ssr: false, // Disable server-side rendering for Lottie
});

interface LottieAnimationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData: any;
  className?: string;
  lazy?: boolean; // Option to enable intersection observer
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  className = "",
  lazy = true,
}) => {
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before element comes into view
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  if (!shouldLoad) {
    return (
      <div
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center ${className}`}
        style={{ minHeight: '200px' }} // Prevent layout shift
      >
        <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full"></div>
      </div>
    );
  }

  return (
    <div className={className} ref={containerRef}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={isVisible || !lazy}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
          progressiveLoad: true, // Load progressively
          hideOnTransparent: true,
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
