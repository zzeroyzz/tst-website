import {
  neuroAnimation,
  traumaAnimation,
  somaticAnimation,
  identityAnimation,
} from "./animations";

export const therapyCards = [
  {
    id:"neuro-card",
    title: "Neuro-Affirming",
    description:["We assess your unique cognitive style and strengths", "Provide ADHD and autism-informed therapy approaches", "Teach executive function skills that actually stick","Create sensory-friendly session environments"],
    animationPath: neuroAnimation,
    altText: "Animation of a brain with gears turning, symbolizing neuro-affirming therapy",
    ctaLinkText:"Get Neuro-Affirming Care"
  },
  {
    id:"trauma-card",
    title: "Trauma-Informed",
    description:["We specialize in complex trauma and PTSD treatment", "Use evidence-based somatic therapy to release stored trauma", "Help you regulate your nervous system safely", "Support healing without re-traumatization"],
    animationPath: traumaAnimation,
    altText: "Animation of a heart with a protective shield, symbolizing trauma-informed care",
    ctaLinkText:"Get Trauma-Informed Care"
  },
  {
    id:"somatic-card",
    title: "Somatic",
    description:["We integrate body-based healing with traditional therapy", "Teach you to recognize and release stored trauma", "Guide breathwork and grounding techniques", "Help you reconnect with your body's wisdom"],
    animationPath: somaticAnimation,
    altText: "Animation of a person meditating with flowing energy, symbolizing somatic therapy",
    ctaLinkText:"Get Somatic Therapy"
  },
  {
    id:"identity-card",
    title: "Identity Work",
    description:["We provide affirming therapy for LGBTQ+ and multicultural clients", "Help you navigate identity exploration and coming out", "Support healthy boundary-setting in relationships","Address intersectional identity challenges with expertise"],
    animationPath: identityAnimation,
    altText: "Animation of diverse hands coming together, symbolizing identity work and inclusivity",
    ctaLinkText:"Get Identity-Affirming Care"
  },
];
