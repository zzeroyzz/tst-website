import React from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

interface ButtonProps {
  id?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  wrapperClassName?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  type = 'button',
  wrapperClassName = '',
  disabled = false,
  id,
}) => {
  return (
    <div className={clsx(styles.wrapper, wrapperClassName)}>
      <div className={styles.shadow} />
      <button
        type={type}
        onClick={onClick}
        className={clsx(styles.button, className)}
        disabled={disabled}
        id={id}
      >
        {children}
      </button>
    </div>
  );
};

export default Button;
