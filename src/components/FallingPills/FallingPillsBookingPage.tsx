import React from 'react';
import styles from './FallingPillsBookingPage.module.css';
import { helpWithKeywords } from '@/data/servicesPageData';

const FallingPillsBookingPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.pills_wrapper}>
        {helpWithKeywords.map((keyword, index) => (
          <div
            key={keyword}
            className={styles.pill_wrapper}
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            <div className={styles.shadow}></div>
            <div className={styles.pill}>{keyword}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FallingPillsBookingPage;
