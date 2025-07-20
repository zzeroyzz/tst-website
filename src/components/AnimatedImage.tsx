/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { LottiePlayer } from './LottiePlayer';
import styles from './AnimatedImage.module.css';

interface AnimatedImageProps {
  // FIXED: Changed prop name to animationPath
  animationData: any;
}

const AnimatedImage: React.FC<AnimatedImageProps> = ({ animationData  }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.shadow} />
      <div className={styles.card}>
          <LottiePlayer
        file={animationData}
        width={400}
        height={400}
        loop={true}
        autoplay={true}
        speed={1}
      />
      </div>
    </div>
  );
};

export default AnimatedImage;
