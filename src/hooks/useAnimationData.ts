/* eslint-disable @typescript-eslint/no-explicit-any */
// src/data/animations.ts
import { useState, useEffect } from 'react';

// Lazy loading functions for each animation
export const loadTiredAnimation = () =>
  import('../../public/assets/Tired.json').then(module => module.default);

export const loadSomaticAnimation = () =>
  import('../../public/assets/Somatic-Animation.json').then(
    module => module.default
  );

export const loadTraumaAnimation = () =>
  import('../../public/assets/Trauma.json').then(module => module.default);

export const loadNeuroAnimation = () =>
  import('../../public/assets/neuro.json').then(module => module.default);

export const loadIdentityAnimation = () =>
  import('../../public/assets/identity.json').then(module => module.default);

export const loadToastyTidbitsAnimation = () =>
  import('../../public/assets/TT-Animation.json').then(
    module => module.default
  );

// Animation loader type
type AnimationLoader = () => Promise<any>;

// Custom hook for loading animations
export const useAnimationData = (loader: AnimationLoader) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    loader()
      .then(data => {
        if (isMounted) {
          setAnimationData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Failed to load animation:', err);
          setError('Failed to load animation');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loader]);

  return { animationData, loading, error };
};

// Preload animations that are critical (e.g., above the fold)
export const preloadAnimation = (loader: AnimationLoader) => {
  return loader().catch(err => {
    console.error('Failed to preload animation:', err);
  });
};

// Helper to preload multiple animations
export const preloadAnimations = (loaders: AnimationLoader[]) => {
  return Promise.allSettled(loaders.map(loader => loader()));
};

// For backwards compatibility, export the original names as lazy loaders
export const tiredAnimation = loadTiredAnimation;
export const somaticAnimation = loadSomaticAnimation;
export const traumaAnimation = loadTraumaAnimation;
export const neuroAnimation = loadNeuroAnimation;
export const identityAnimation = loadIdentityAnimation;
export const toastyTidbitsAnimation = loadToastyTidbitsAnimation;
