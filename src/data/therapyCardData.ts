import {
  neuroAnimation,
  traumaAnimation,
  somaticAnimation,
  identityAnimation,
} from './animations';

export const therapyCards = [
  {
    id: 'neuro-card',
    title: 'Neuro-Affirming',
    description: [
      "Work with your brain's natural wiring, not against it",
      'Build executive function skills that fit your unique style',
      'Create sensory-friendly spaces where you can unmask safely',
      'Shift RSD patterns into responses that serve you better',
    ],
    animationPath: neuroAnimation,
    altText:
      'Animation of a brain with gears turning, symbolizing neuro-affirming therapy',
    ctaLinkText: 'Get Neuro-Affirming Care',
  },
  {
    id: 'trauma-card',
    title: 'Trauma-Informed',
    description: [
      "Approach trauma healing at your nervous system's pace",
      'Guide you through releasing stored tension and hypervigilance',
      'Support you in rebuilding safety in relationships',
      'Explore gentle ways to process flashbacks and reconnection',
    ],
    animationPath: traumaAnimation,
    altText:
      'Animation of a heart with a protective shield, symbolizing trauma-informed care',
    ctaLinkText: 'Get Trauma-Informed Care',
  },
  {
    id: 'somatic-card',
    title: 'Somatic',
    description: [
      "Reconnect with your body's signals and wisdom",
      'Learn grounding techniques that actually calm your system',
      'Explore how trauma shows up in your body and muscle tension',
      'Develop manageable practices for daily regulation',
    ],
    animationPath: somaticAnimation,
    altText:
      'Animation of a person meditating with flowing energy, symbolizing somatic therapy',
    ctaLinkText: 'Get Somatic Therapy',
  },
  {
    id: 'identity-card',
    title: 'Identity Work',
    description: [
      'Share your experiences without feeling like you have to explain them',
      'Learn to embrace who you are while the world tries to erase you',
      'Explore how to recognize and build relationships that truly see you',
      'Work through the exhaustion of existing at multiple intersections of marginalization',
    ],
    animationPath: identityAnimation,
    altText:
      'Animation of diverse hands coming together, symbolizing identity work and inclusivity',
    ctaLinkText: 'Get Identity-Affirming Care',
  },
];
