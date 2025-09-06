// @/data/belowTheFoldData.ts

export const heroContent = {
  headline: {
    title: 'You deserve therapy that truly gets you',
    subtitle:
      'Affirming, trauma-informed care for complex humans living authentic lives',
  },

  cta: {
    title: "You don't have to figure this out alone",
    description:
      "Here, you'll have someone in your corner, helping you feel more grounded, understood, and supported.",
    buttonText: 'Book Your Free 15-Minute Consultation',
    buttonLink: '/contact',
  },
};

export const symptomCards = [
  {
    id: 'trauma',
    tags: ['Trauma', 'PTSD', 'Complex PTSD'],
    tagBgColor: 'bg-tst-teal',
    emoji: '🧠',
    title: 'When the past keeps showing up',
    symptoms: [
      'Flashbacks or nightmares that disrupt your sleep',
      'Feeling emotionally numb or disconnected',
      'Panic attacks that come out of nowhere',
      'Hypervigilance that exhausts you daily',
      'Feeling guarded in relationships',
    ],
    imageLink:
      'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/star.webp',
    imageAlt: 'Heart with a band-aid, symbolizing trauma and mental health',
  },
  {
    id: 'neurodivergent',
    tags: ['ADHD', 'Autism', 'Executive Dysfunction'],
    tagBgColor: 'bg-tst-green',
    emoji: '🎭',
    title: 'When your brain works differently',
    symptoms: [
      'Executive dysfunction making daily tasks feel impossible',
      'Sensory overload in everyday environments',
      "Masking who you are until you're exhausted",
      'RSD making criticism feel devastating',
      'Hyperfocus followed by complete burnout',
    ],
    imageLink:
      'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/below-fold-neuro-icon.webp',
    imageAlt: 'Illustration of a brain, symbolizing neurodivergent therapy',
  },
  {
    id: 'lgbtqia',
    tags: ['LGBTQIA+', 'Identity', 'Gender-Affirming'],
    tagBgColor: 'bg-tst-purple',
    emoji: '🏳️‍🌈',
    title: "When the world doesn't affirm who you are",
    symptoms: [
      'Identity-based trauma from exclusion or discrimination',
      'Internalized shame about your authentic self',
      'Family or religious rejection of your identity',
      'Anxiety about coming out or transitioning',
      'Navigating intersections of racial, LGBTQIA+, and non-monogamous identities',
    ],
    imageLink:
      'https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/btf-pride.webp',
    imageAlt: 'Pride flag star representing LGBTQIA+ identity',
  },
];