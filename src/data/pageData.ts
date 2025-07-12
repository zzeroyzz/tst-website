import {
  neuroAnimation,
  traumaAnimation,
  somaticAnimation,
  identityAnimation,
} from "./animations";

export const socialProofIcons = [
  {
    bgColor: "bg-tst-teal",
    iconUrl: "/assets/profile-3.svg",
    altText: "Icon 1",
    className: "",
  },
  {
    bgColor: "bg-tst-teal",
    iconUrl: "/assets/profile-3.svg",
    altText: "Icon 2",
    className: "",
  },
  {
    bgColor: "bg-tst-teal",
    iconUrl: "/assets/profile-3.svg",
    altText: "Icon 3",
    className: "",
  },
  {
    bgColor: "bg-tst-teal",
    iconUrl: "/assets/profile-3.svg",
    altText: "Icon 4",
    className: "",
  },
  {
    bgColor: "bg-tst-teal",
    iconUrl: "/assets/profile-3.svg",
    altText: "More icon",
    className: "",
  },
];

export const testimonials = [
  {
    quote:
      "I felt safe bringing in my real emotions. Messy, complicated, unfiltered. I didn't have to explain or justify them.",
    iconUrl: "/assets/profile-3.svg",
    bgColor: "bg-tst-teal",
  },
  {
    quote:
      "The way things were reflected back helped me feel compassion instead of shame. I started to believe I wasn't broken. Just human.",
    iconUrl: "/assets/profile-3.svg",
    bgColor: "bg-tst-teal",
  },
  {
    quote:
      "Therapy helped me reconnect with parts of myself I hadn't felt in years. I feel more grounded, more real, more me.",
    iconUrl: "/assets/profile-3.svg",
    bgColor: "bg-tst-teal",
  },
];
export const checklistItems = [
  "You meet others' needs and lose track of your own.",
  "You feel everything, even when you wish you didn't.",
  "You're tired in a way rest doesn't fix.",
  "You're ready for change, but don't know where to start.",
];

export const therapyCards = [
  {
    title: "Neuro-Affirming",
    description:
      "We work with your brain, not against it. Sensory needs, executive function, and nonlinear growth are all valid parts of your process.",
    animationData: neuroAnimation,
  },
  {
    title: "Trauma-Informed",
    description:
      "We move at your pace and honor your nervous system. This work centers safety, trust, and regulation so your healing isn't rushed or forced.",
    animationData: traumaAnimation,
  },
  {
    title: "Somatic",
    description:
      "Your body holds wisdom, not just symptoms. Together, we build safe ways to listen, release, and come back to yourself.",
    animationData: somaticAnimation,
  },
  {
    title: "Identity Work",
    description:
      "We make space for your gender, sexuality, race, neurodivergence, and relationships. Together, we build the boundaries that help you stay connected to who you are.",
    animationData: identityAnimation,
  },
];

export const meetYourTherapist = {
  title: "Meet your therapist",
  paragraphs: [
    "I'm Kay (she/they), a Korean American, queer, neurodivergent therapist living with CPTSD.",
    "I work with people who carry a lot. The ones who make space for everyone else and rarely get that same care in return.",
    "My practice is shaped by lived experience, strong values, and the belief that healing is personal but never separate from the world we live in.",
    "Here, you don't have to explain who you are. You get to bring your full self.",
  ],
};

export const howItWorksSteps = [
  {
    number: "01",
    title: "Submit the contact form",
    description: "Just enter your name and contact info. I’ll follow up by email.",
    imageUrl: "/assets/step_1.png",
    imageAlt: "Illustration of a cloud holding a phone",
    isLastStep:false,
  },
  {
    number: "02",
    title: "Schedule a free consultation",
    description: "We’ll meet for 15 to 20 minutes to see if it feels like a good fit. No pressure to decide on the spot.",
    imageUrl: "/assets/step_2.png",
    imageAlt: "Illustration of a calendar",
    isLastStep:false,
  },
  {
    number: "03",
    title: "Book your first session",
    description: "If it feels right, we’ll begin at your pace and shape care around what you need most.",
    imageUrl: "/assets/step_3.png",
    imageAlt: "Illustration of a cloud character at a laptop",
    isLastStep:false,
  },
  {
    number: "04",
    title: "Start feeling more supported",
    description: "This is space to feel steadier, more connected, and more like yourself again.",
    imageUrl: "/assets/step_4.png",
    imageAlt: "Illustration of a cloud character at a laptop",
    isLastStep:true,
  },
];
