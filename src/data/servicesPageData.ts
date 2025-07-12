// src/data/servicesPageData.ts

import {
  somaticAnimation,
  identityAnimation,
  neuroAnimation,
  traumaAnimation,
} from "./animations";

// Data for the "What We Help With" section (SEO keywords)
export const helpWithKeywords = [
  "Anxiety & Overwhelm",
  "Trauma & CPTSD",
  "Burnout & Exhaustion",
  "Self-Esteem Issues",
  "Relationship Challenges",
  "Life Transitions",
  "Identity Exploration",
  "Neurodivergence Support",
  "Stress Management",
];

// Data for the single service offering
export const individualTherapyData = {
    title: "One-on-One Support",
    description: "A collaborative, confidential space dedicated to you. We'll explore your inner world, process challenges, and work toward your personal healing and growth goals at a pace that feels safe and supportive.",
    tags: ["50-minute sessions", "Virtual & Phone", "Personalized Approach"],
    animationData: somaticAnimation,
};

// Data for the expanded "Our Approach" section
export const ourApproachData = [
  {
    title: "Neuro-Affirming",
    description: "We work with your brain, not against it. Sensory needs, executive function, and nonlinear growth are all valid parts of your process.",
    benefits: [
      "We celebrate the unique ways your brain works, rather than trying to 'fix' it.",
      "Sessions are flexible to accommodate your sensory needs and energy levels.",
      "Your natural ways of processing and communicating are respected and validated.",
    ],
    animationData: neuroAnimation,
  },
  {
    title: "Trauma-Informed",
    description: "We move at your pace and honor your nervous system. This work centers safety, trust, and regulation so your healing isn't rushed or forced.",
    benefits: [
        "Your safety is our top priority. We always move at a pace that feels comfortable for you.",
        "We focus on building trust and collaboration in our therapeutic relationship.",
        "The goal is to empower you with tools for regulation, not to force you to relive painful memories.",
    ],
    animationData: traumaAnimation,
  },
    {
    title: "Somatic",
    description: "Your body holds wisdom, not just symptoms. Together, we build safe ways to listen, release, and come back to yourself.",
    benefits: [
        "We gently explore the connection between your body's sensations and your emotions.",
        "You'll learn practical techniques to release stored tension and calm your nervous system.",
        "It's about learning to listen to your body's wisdom as a path to healing and wholeness.",
    ],
    animationData: somaticAnimation,
  },
  {
    title: "Identity Work",
    description: "We make space for your gender, sexuality, race, neurodivergence, and relationships. Together, we build the boundaries that help you stay connected to who you are.",
    benefits: [
        "This is a safe space to explore all facets of who you are without judgment.",
        "We help you build and reinforce boundaries that protect your energy and sense of self.",
        "Your lived experience is honored as a central and valid part of your story.",
    ],
    animationData: identityAnimation,
  },
];
