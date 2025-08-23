'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './AnimatedCheckbox.module.css';

interface AnimatedCheckboxProps {
  id: string;
  label: string;
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({ id, label }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <label
      htmlFor={id}
      className="flex items-center gap-4 cursor-pointer group"
    >
      <input
        id={id}
        type="checkbox"
        className="hidden"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
      />

      <div className={styles.wrapper}>
        <div className={styles.shadow}></div>
        <div
          className={clsx(
            styles.checkbox,
            'w-6 h-6 flex items-center justify-center',
            'bg-tst-cream',
            isChecked && 'bg-tst-purple'
          )}
        >
          {isChecked && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3334 4L6.00008 11.3333L2.66675 8"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="font-medium text-lg">{label}</span>
    </label>
  );
};

export default AnimatedCheckbox;
