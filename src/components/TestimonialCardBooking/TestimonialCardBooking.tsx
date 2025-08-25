// src/components/TestimonialCard/TestimonialCard.tsx
'use client';

import React from 'react';
import CircleIcon from '@/components/CircleIcon/CircleIcon';
import styles from './TestimonialCardBooking.module.css';
import clsx from 'clsx';

interface TestimonialCardProps {
  quote: string;
  iconUrl: string;
  bgColor: string;   // e.g. "bg-tst-purple" (CircleIcon prop)
  altText: string;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  iconUrl,
  bgColor,
  altText,
  className = '',
}) => {
  return (

    <div className={clsx(styles.card_wrapper, className)}>
      <div className={styles.card_shadow} />
      <div className={styles.card}>
        <div className={styles.icon_row}>
          <CircleIcon size="md" bgColor={bgColor} iconUrl={iconUrl} altText={altText} />
        </div>
        <p className={clsx(styles.quote, styles.center)}>
          &quot;{quote}&quot;
        </p>
      </div>
    </div>
  );
};

export default TestimonialCard;
