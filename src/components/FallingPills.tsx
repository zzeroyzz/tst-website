import React from 'react';
import styles from './FallingPills.module.css';
import { helpWithKeywords } from '@/data/servicesPageData';

const FallingPills = () => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>What We Help With</h2>
            <div className={styles.pills_wrapper}>
                {helpWithKeywords.map((keyword, index) => (
                    <div
                        key={keyword}
                        className={styles.pill_wrapper}
                        style={{ animationDelay: `${index * 0.07}s` }}
                    >
                        <div className={styles.shadow}></div>
                        <div className={styles.pill}>
                            {keyword}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FallingPills;
