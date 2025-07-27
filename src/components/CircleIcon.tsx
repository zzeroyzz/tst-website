import React from "react";
import clsx from "clsx";
import Image from "next/image";
import styles from "./CircleIcon.module.css";

interface CircleIconProps {
  bgColor: string;
  iconUrl: string;
  size?: "xs" | "sm" | "md" | "lg";
  wrapperClassName?: string;
}

const CircleIcon: React.FC<CircleIconProps> = ({
  bgColor,
  iconUrl,
  size = "sm",
  wrapperClassName = "",
}) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const imageSizes = {
    xs: 24,
    sm: 48,
    md: 68,
    lg: 78,
  };

  return (
    <div className={clsx(styles.wrapper, wrapperClassName)}>
      <div className={styles.shadow} />
      <div className={clsx(styles.icon, bgColor, sizeClasses[size])}>
        <Image
          src={iconUrl}
          alt=""
          width={imageSizes[size]}
          height={imageSizes[size]}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default CircleIcon;
