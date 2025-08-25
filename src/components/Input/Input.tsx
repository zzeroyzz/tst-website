import React from 'react';
import styles from './Input.module.css';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

const Input: React.FC<InputProps> = ({ wrapperClassName, ...props }) => {
  return (
    <div className={clsx(styles.wrapper, wrapperClassName)}>
      <div className={styles.shadow} />
      <input {...props} className={styles.input} />
    </div>
  );
};

export default Input;
