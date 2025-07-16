import React from 'react';
import LottieAnimation from './LottieAnimation';
import styles from './AnimatedImage.module.css';

interface AnimatedImageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData: any;
}

const AnimatedImage: React.FC<AnimatedImageProps> = ({ animationData  }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.shadow} />
      <div className={styles.card}>
        <LottieAnimation animationData={animationData} />
      </div>
    </div>
  );
};

export default AnimatedImage;
