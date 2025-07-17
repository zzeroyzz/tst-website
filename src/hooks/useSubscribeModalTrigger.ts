"use client";

import { useState, useEffect } from 'react';

/**
 * A simple hook to trigger a modal after a delay, only once per session.
 * @param delay The delay in milliseconds before the modal is triggered.
 * @returns An object with the modal's open state and a function to update it.
 */
export const useSubscribeModalTrigger = (delay: number = 7000) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check sessionStorage to see if the modal has already been shown
      const hasModalBeenShown = sessionStorage.getItem('hasModalBeenShown');
      if (!hasModalBeenShown) {
        setIsModalOpen(true);
        sessionStorage.setItem('hasModalBeenShown', 'true');
      }
    }, delay);

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [delay]);

  return { isModalOpen, setIsModalOpen };
};
