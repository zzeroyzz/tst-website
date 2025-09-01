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
  variant?: 'default' | 'rounded-full';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  type = 'button',
  wrapperClassName = '',
  disabled = false,
  variant = 'default',
  id,
}) => {
  const shadowClass = variant === 'rounded-full' ? styles.shadowRounded : styles.shadow;
  const buttonClass = variant === 'rounded-full' ? styles.buttonRounded : styles.button;

  return (
    <div className={clsx(styles.wrapper, wrapperClassName)}>
      <div className={shadowClass} />
      <button
        type={type}
        onClick={onClick}
        className={clsx(buttonClass, className)}
        disabled={disabled}
        id={id}
      >
        {children}
      </button>
    </div>
  );
};

export default Button;
