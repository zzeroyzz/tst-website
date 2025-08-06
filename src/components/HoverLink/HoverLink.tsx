import Link from 'next/link';
import React from 'react';
import styles from './HoverLink.module.css'; // Import the CSS module

// Define the props the component will accept
type HoverLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

const HoverLink = ({ href, children, className = '', id }: HoverLinkProps) => {
  return (
    <Link
      href={href}
      id={id}
      className={`${styles.link} ${className}`}
    >
      <svg
        className={styles.icon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
      <span className={styles.text}>{children}</span>
    </Link>
  );
};

export default HoverLink;
