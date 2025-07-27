import {
  neuroAnimation,
  traumaAnimation,
  somaticAnimation,
  identityAnimation,
} from "./animations";

export const therapyCards = [
  {
    title: "Neuro-Affirming",
    description:
      "We work with your brain, not against it. Sensory needs, executive function, and nonlinear growth are all valid parts of your process.",
    animationPath: neuroAnimation,
    altText: "Animation of a brain with gears turning, symbolizing neuro-affirming therapy",
  },
  {
    title: "Trauma-Informed",
    description:
      "We move at your pace and honor your nervous system. This work centers safety, trust, and regulation so your healing isn't rushed or forced.",
    animationPath: traumaAnimation,
    altText: "Animation of a heart with a protective shield, symbolizing trauma-informed care",
  },
  {
    title: "Somatic",
    description:
      "Your body holds wisdom, not just symptoms. Together, we build safe ways to listen, release, and come back to yourself.",
    animationPath: somaticAnimation,
    altText: "Animation of a person meditating with flowing energy, symbolizing somatic therapy",
  },
  {
    title: "Identity Work",
    description:
      "We make space for your gender, sexuality, race, neurodivergence, and relationships. Together, we build the boundaries that help you stay connected to who you are.",
    animationPath: identityAnimation,
    altText: "Animation of diverse hands coming together, symbolizing identity work and inclusivity",
  },
];
