import React from "react";
import clsx from "clsx";
import Image from "next/image";
import styles from "./CircleIcon.module.css";

interface CircleIconProps {
  bgColor: string;
  iconUrl: string;
  altText: string;
  size?: "sm" | "md" | "lg";
  wrapperClassName?: string;
}

const CircleIcon: React.FC<CircleIconProps> = ({
  bgColor,
  iconUrl,
  altText,
  size = "sm",
  wrapperClassName = "",
}) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const imageSizes = {
    sm: 40,
    md: 50,
    lg: 64,
  };

  return (
    <div className={clsx(styles.wrapper, wrapperClassName)}>
      <div className={styles.shadow} />
      <div className={clsx(styles.icon, bgColor, sizeClasses[size])}>
        <Image
          src={iconUrl}
          alt={altText}
          width={imageSizes[size]}
          height={imageSizes[size]}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
};

export default CircleIcon;
