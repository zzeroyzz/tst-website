// src/components/KeywordPill.tsx

import React from 'react';
import styles from './KeywordPill.module.css';

interface KeywordPillProps {
  children: React.ReactNode;
}

const KeywordPill: React.FC<KeywordPillProps> = ({ children }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.shadow} />
      <div className={styles.pill}>{children}</div>
    </div>
  );
};

export default KeywordPill;
