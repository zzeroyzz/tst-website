import {
  somaticAnimation,
  identityAnimation,
  neuroAnimation,
  traumaAnimation,
} from "./animations";

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
  "Polyamory & Non-Monogamy",
  "LGBTQ+ Affirming",
  "Cultural Identity",
  "BIPOC Affirming",
];

export const individualTherapyData = {
    title: "One-on-One Support",
    description: "A supportive space to help you feel less alone in what you're holding. Together, we'll explore what’s been weighing on you, make sense of your experiences, and move at a pace that feels safe and manageable. This work is personalized and collaborative. It's guided by your needs, your voice, and your goals.",
    tags: ["50-minute sessions", "Virtual & Phone", "Personalized Approach"],
    animationData: somaticAnimation,
};

export const ourApproachData = [
  {
    title: "Neuro-Affirming",
    description: "We work with your brain, not against it. Sensory needs, executive function, and nonlinear growth are all valid parts of your process.",
    benefits: [
      "We celebrate the unique ways your brain works, rather than trying to 'fix' it.",
      "Sessions are flexible to accommodate your sensory needs and energy levels.",
      "Your natural ways of processing and communicating are respected and validated.",
    ],
    animationData: neuroAnimation, // <-- FIX: Renamed from animationData
  },
  {
    title: "Trauma-Informed",
    description: "We move at your pace and honor your nervous system. This work centers safety, trust, and regulation so your healing isn't rushed or forced.",
    benefits: [
        "Your safety is our top priority. We always move at a pace that feels comfortable for you.",
        "We focus on building trust and collaboration in our therapeutic relationship.",
        "The goal is to empower you with tools for regulation, not to force you to relive painful memories.",
    ],
    animationData: traumaAnimation, // <-- FIX: Renamed from animationData
  },
    {
    title: "Somatic",
    description: "Your body holds wisdom, not just symptoms. Together, we build safe ways to listen, release, and come back to yourself.",
    benefits: [
        "We gently explore the connection between your body's sensations and your emotions.",
        "You'll learn practical techniques to release stored tension and calm your nervous system.",
        "It's about learning to listen to your body's wisdom as a path to healing and wholeness.",
    ],
    animationData: somaticAnimation, // <-- FIX: Renamed from animationData
  },
  {
    title: "Identity Work",
    description: "We make space for your gender, sexuality, race, neurodivergence, and relationships. Together, we build the boundaries that help you stay connected to who you are.",
    benefits: [
        "This is a safe space to explore all facets of who you are without judgment.",
        "We help you build and reinforce boundaries that protect your energy and sense of self.",
        "Your lived experience is honored as a central and valid part of your story.",
    ],
    animationData: identityAnimation, // <-- FIX: Renamed from animationData
  },
];
