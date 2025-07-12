import React from 'react';
import Image from 'next/image';
import styles from './WallOfLoveCard.module.css';

interface WallOfLoveCardProps {
  testimonial: {
    quote: string;
    name: string;
    role: string;
    avatar: string;
  };
}

const WallOfLoveCard: React.FC<WallOfLoveCardProps> = ({ testimonial }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.shadow} />
      <div className={styles.card}>
        <p className={styles.quote}>&quot;{testimonial.quote}&quot;</p>
        <div className={styles.author}>
          <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className={styles.avatar} />
          <div>
            <p className={styles.name}>{testimonial.name}</p>
            <p className={styles.role}>{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WallOfLoveCard;
