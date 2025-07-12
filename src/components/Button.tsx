import React from "react";
import clsx from "clsx";
import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  wrapperClassName?: string; // Add this new prop
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  type = "button",
  wrapperClassName = "", // Add this
}) => {
  return (
    // Apply the new wrapperClassName here
    <div className={clsx(styles.wrapper, wrapperClassName)}>
      <div className={styles.shadow} />
      <button
        type={type}
        onClick={onClick}
        className={clsx(styles.button, className)}
      >
        {children}
      </button>
    </div>
  );
};

export default Button;
