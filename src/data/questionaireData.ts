export const workingOnOptions = [
  'Anxiety & Overwhelm',
  'Trauma & CPTSD',
  'Burnout & Exhaustion',
  'Self-Esteem Issues',
  'Relationship Challenges',
  'Life Transitions',
  'Identity Exploration',
  'Neurodivergence Support',
  'Stress Management',
  'Other',
];

export const schedulingOptions = [
  { value: 'weekly', label: 'Weekly sessions' },
  { value: 'biweekly', label: 'Every two weeks' },
  { value: 'flexible', label: 'Flexible scheduling as needed' },
];

export const paymentOptions = [
  { value: 'out-of-pocket', label: 'Pay out of pocket' },
  { value: 'insurance', label: 'Insurance (superbill only)' },
  { value: 'fund', label: 'Therapy Fund (for approved clients)' },
];

export const budgetOptions = [
  { value: true, label: 'Yes, $150 per session works for my budget' },
  { value: false, label: 'No, I need to explore other options' },
];

export const location = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

export const therapyFunds = [
  {
    name: 'OpenPath Collective',
    description: 'Sessions ranging from $30–$60',
    url: 'https://openpathcollective.org',
    details:
      'A nonprofit network of mental health professionals providing affordable therapy',
  },
  {
    name: 'Inclusive Therapists',
    description: 'Some providers offer sliding scale',
    url: 'https://www.inclusivetherapists.com',
    details:
      'Identity-centered therapist directory focused on marginalized communities',
  },
  {
    name: 'Lotus Therapy Fund',
    description: 'Free therapy for Asian Americans',
    url: 'https://www.asianmhc.org/free-therapy-funds/',
    details: 'Offered through the Asian Mental Health Collective',
  },
  {
    name: 'BIPOC Therapy Fund',
    description: 'Free therapy sessions for the Global Majority',
    url: 'https://mentalhealthliberation.org/bipoc-therapy-fund/',
    details: 'From Mental Health Liberation',
  },
];
