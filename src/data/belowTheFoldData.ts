// @/data/belowTheFoldData.ts

export const heroContent = {
  headline: {
    title: "You deserve therapy that truly gets you",
    subtitle: "Affirming, trauma-informed care for complex humans living authentic lives"
  },

  cta: {
    title: "You don't have to figure this out alone",
    description: "Virtual therapy across Georgia for trauma survivors, neurodivergent folks, and LGBTQIA+ individuals who are ready to heal and thrive authentically.",
    buttonText: "Book Your Free 15-Minute Consultation",
    buttonLink: "/contact"
  }
};

export const symptomCards = [
  {
    id: "trauma",
    tags: ["Trauma", "PTSD", "Complex PTSD"],
    tagBgColor: "bg-tst-teal",
    emoji: "🧠",
    title: "When the past keeps showing up",
    symptoms: [
      "Flashbacks or nightmares that disrupt your sleep",
      "Feeling emotionally numb or disconnected",
      "Panic attacks that come out of nowhere",
      "Hypervigilance that exhausts you daily",
      "Feeling guarded in relationships"
    ],
    imageLink:"https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/star.webp",
    imageAlt: "Heart with a band-aid, symbolizing trauma and mental health",

  },
  {
    id: "neurodivergent",
    tags: ["ADHD", "Autism", "Executive Dysfunction"],
    tagBgColor: "bg-tst-green",
    emoji: "🎭",
    title: "When your brain works differently",
    symptoms: [
      "Executive dysfunction making daily tasks feel impossible",
      "Sensory overload in everyday environments",
      "Masking who you are until you're exhausted",
      "RSD making criticism feel devastating",
      "Hyperfocus followed by complete burnout"
    ],
    imageLink:"https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/below-fold-neuro-icon.webp",
    imageAlt: "Illustration of a brain, symbolizing neurodivergent therapy",

  },
  {
    id: "lgbtqia",
    tags: ["LGBTQIA+", "Identity", "Gender-Affirming"],
    tagBgColor: "bg-tst-purple",
    emoji: "🏳️‍🌈",
    title: "When the world doesn't affirm who you are",
    symptoms: [
      "Identity-based trauma from exclusion or discrimination",
      "Internalized shame about your authentic self",
      "Family or religious rejection of your identity",
      "Anxiety about coming out or transitioning",
      "Navigating intersections of racial, LGBTQIA+, and non-monogamous identities"
    ],
    imageLink:"https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/btf-pride.webp",
    imageAlt: "Pride flag star representing LGBTQIA+ identity",

  }
];

// Alternative version with more granular control
export const symptomCardsDetailed = [
  {
    id: "trauma",
    category: "Trauma & PTSD",
    icon: {
      emoji: "🧠",
      alt: "Brain representing mental health"
    },
    title: "When your mind feels overwhelming",
    description: "Complex trauma and PTSD symptoms that impact daily life",
    symptoms: [
      {
        text: "Flashbacks or nightmares that disrupt your sleep",
        severity: "high"
      },
      {
        text: "Feeling emotionally numb or disconnected",
        severity: "medium"
      },
      {
        text: "Panic attacks that come out of nowhere",
        severity: "high"
      },
      {
        text: "Hypervigilance that exhausts you daily",
        severity: "medium"
      },
      {
        text: "Trust issues affecting your relationships",
        severity: "medium"
      }
    ],
    therapyApproach: "Trauma-informed, somatic therapy",
    styling: {
      cardClass: "trauma-card",
      accentColor: "#ff6b6b"
    }
  },
  {
    id: "neurodivergent",
    category: "Neurodivergent Support",
    icon: {
      emoji: "🎭",
      alt: "Theater masks representing masking/identity"
    },
    title: "When your brain works differently",
    description: "ADHD, autism, and executive function challenges",
    symptoms: [
      {
        text: "Executive dysfunction making daily tasks impossible",
        severity: "high"
      },
      {
        text: "Sensory overload in \"normal\" environments",
        severity: "medium"
      },
      {
        text: "Masking who you are until you're exhausted",
        severity: "high"
      },
      {
        text: "RSD making criticism feel devastating",
        severity: "medium"
      },
      {
        text: "Hyperfocus followed by complete burnout",
        severity: "high"
      }
    ],
    therapyApproach: "Neurodivergent-affirming therapy",
    styling: {
      cardClass: "neurodivergent-card",
      accentColor: "#48dbfb"
    }
  },
  {
    id: "lgbtqia",
    category: "LGBTQIA+ Affirming",
    icon: {
      emoji: "🏳️‍🌈",
      alt: "Pride flag representing LGBTQIA+ identity"
    },
    title: "When the world doesn't affirm who you are",
    description: "Identity-based trauma and affirming support",
    symptoms: [
      {
        text: "Identity-based trauma from rejection or discrimination",
        severity: "high"
      },
      {
        text: "Internalized shame about your authentic self",
        severity: "high"
      },
      {
        text: "Family or religious trauma around your identity",
        severity: "high"
      },
      {
        text: "Anxiety about coming out or transitioning",
        severity: "medium"
      },
      {
        text: "Finding community while healing past wounds",
        severity: "medium"
      }
    ],
    therapyApproach: "LGBTQIA+ affirming, identity-centered therapy",
    styling: {
      cardClass: "identity-highlight",
      accentColor: "rainbow",
      showPrideAccent: true,
      prideColors: ["#e40303", "#ff8c00", "#ffed00", "#008c00", "#0066cc", "#732982"]
    }
  }
];

// Additional data for animations or interactions
export const animationConfig = {
  cardHover: {
    scale: 1.02,
    translateY: -5,
    duration: 0.3
  },
  prideAnimation: {
    duration: 3,
    type: "rainbow-flow"
  }
};

// SEO-friendly alt text and metadata
export const seoData = {
  section: {
    title: "Therapy for Trauma, ADHD, and LGBTQIA+ Community in Georgia",
    description: "Specialized virtual therapy addressing complex trauma, neurodivergent needs, and LGBTQIA+ affirming care across Georgia."
  },
  cards: {
    trauma: "Complex trauma and PTSD therapy symptoms and support",
    neurodivergent: "ADHD and autism therapy for neurodivergent adults",
    lgbtqia: "LGBTQIA+ affirming therapy and identity-based trauma support"
  }
};
