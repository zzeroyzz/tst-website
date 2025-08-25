'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './IconCircle.module.css';

interface IconCircleProps {
  icon: React.ReactNode;
  bgColor: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  wrapperClassName?: string;
}

const IconCircle: React.FC<IconCircleProps> = ({
  icon,
  bgColor,
  size = 'sm',
  wrapperClassName = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <div className={clsx(styles.wrapper, wrapperClassName)}>
      <div className={styles.shadow} />
      <div className={clsx(styles.icon, bgColor, sizeClasses[size])}>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default IconCircle;