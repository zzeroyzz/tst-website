'use client';
import React, { useEffect, useRef, useState } from 'react';

interface LottieProps {
  /** filename under /public/animations/, including ".lottie" */
  file: string;
  width?: number;
  height?: number;
  speed?: number;
  loop?: boolean;
  autoplay?: boolean;
  alt: string;
}

export function LottiePlayer({
  file,
  width = 500,
  height = 500,
  speed = 1,
  loop = true,
  autoplay = true,
  alt,
}: LottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isDecorative = alt === '';

  useEffect(() => {
    let isMounted = true;

    const loadPlayer = async () => {
      try {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // Dynamically import the player component
        await import('@dotlottie/player-component');

        // Check if still mounted and container exists
        if (!isMounted || !containerRef.current) return;

        // Create the player element
        const player = document.createElement('dotlottie-player');
        player.setAttribute('src', `/animations/${file}`);
        player.setAttribute('background', 'transparent');
        player.setAttribute('speed', speed.toString());

        if (loop) player.setAttribute('loop', '');
        if (autoplay) player.setAttribute('autoplay', '');

        player.style.width = `${width}px`;
        player.style.height = `${height}px`;

        // Add error handling
        player.addEventListener('error', e => {
          console.error('DotLottie player error:', e);
          console.error('File path:', `/animations/${file}`);
        });

        player.addEventListener('ready', () => {
          if (isMounted) {
            setIsLoaded(true);
          }
        });

        // Remove old player if it exists
        if (
          playerRef.current &&
          playerRef.current.parentNode === containerRef.current
        ) {
          containerRef.current.removeChild(playerRef.current);
        }

        // Store reference and append new player
        playerRef.current = player;
        containerRef.current.appendChild(player);
      } catch (error) {
        console.error('Failed to load DotLottie player:', error);
      }
    };

    loadPlayer();

    // Cleanup
    return () => {
      isMounted = false;
      setIsLoaded(false);

      // Safely remove player
      if (playerRef.current && playerRef.current.parentNode) {
        playerRef.current.parentNode.removeChild(playerRef.current);
        playerRef.current = null;
      }
    };
  }, [file, width, height, speed, loop, autoplay]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className="flex items-center justify-center"
      role="img"
      aria-label={!isDecorative ? alt : undefined}
      aria-hidden={isDecorative ? 'true' : undefined}
    >
      {!isLoaded && (
        <div
          className="bg-gray-100 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
    </div>
  );
}
