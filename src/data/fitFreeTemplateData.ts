export const fitFreeTemplate = [
  {
    id: '1',
    name: 'Confirmation',
    category: 'WELCOME',
    content:
      "Hi {{client_name}}—this is the Toasted Sesame Care Team for Kay. You’re set for {{day_time_et}}. Quick 3 Qs to prep—OK to text here? If needed: reply 2 to RESCHEDULE, 3 to CANCEL, or tap: {{manage_link}}. Reply HELP for support. Reply STOP to opt out.",
    variables: ['client_name', 'day_time_et', 'manage_link'],
  },
  {
    id: '2',
    name: 'Qualification - State',
    category: 'INTAKE',
    content: "Are you in Georgia?\n1 = Yes\n2 = No",
    variables: [],
  },
  {
    id: '3',
    name: 'Not In State - Referrals',
    category: 'INTAKE',
    content:
      "Thanks for letting us know. Here are a few referrals that may help: {{ref_a}}, {{ref_b}}. Wishing you the best.",
    variables: ['ref_a', 'ref_b'],
  },
  {
    id: '4',
    name: 'Fit-or-Free Offer',
    category: 'INTAKE',
    content:
      "We run a Fit or Free first session. If it doesn’t feel helpful or like a fit, there’s no charge. If it does, we’ll continue weekly or bi-weekly. Sound fair?\n1 = Yes\n2 = No",
    variables: [],
  },
  {
    id: '5',
    name: 'Private Pay Rate',
    category: 'INTAKE',
    content:
      "Great, sessions are $150 private pay. We can provide a superbill for out-of-network reimbursement. Proceed?\n1 = Yes\n2 = What’s a superbill?\n3 = Prefer insurance referrals",
    variables: [],
  },
  {
    id: '6',
    name: 'What is a Superbill',
    category: 'INTAKE',
    content:
      "A superbill is a receipt with the codes your insurer needs for out-of-network reimbursement. Many clients submit and get partial reimbursement, but it depends on your plan.\nProceed private pay while you check reimbursement?\n1 = Yes\n2 = Prefer insurance referrals",
    variables: [],
  },
  {
    id: '7',
    name: 'Insurance Referrals',
    category: 'INTAKE',
    content:
      "Got it. We’re private pay only, but here are two great resources to find in-network or reduced-fee support:\n• Open Path Collective (affordable sessions) {{ref_open_path}}\n• Inclusive Therapists (affirming providers) {{ref_inclusive}}\nWishing you the best.\nIf you’d ever like to revisit private pay with us, you’re welcome to schedule another consultation {{manage_link}}.",
    variables: ['ref_open_path', 'ref_inclusive', 'manage_link'],
  },
  {
    id: '8',
    name: 'Main Focus Menu',
    category: 'INTAKE',
    content:
      "Main focus?\n1 = Anxiety\n2 = Trauma\n3 = Burnout\n4 = Self-Esteem\n5 = Relationships\n6 = Transitions\n7 = Identity\n8 = ND Support\n9 = Stress\n0 = Other",
    variables: [],
  },
  {
    id: '9',
    name: 'Main Focus Acknowledgement',
    category: 'INTAKE',
    content: "Got it—will tailor to {{focus_label}}.",
    variables: ['focus_label'],
  },
  {
    id: '10',
    name: 'Pull-Forward Offer',
    category: 'SCHEDULING',
    content:
      "I can get you in sooner if that helps. Here’s what’s open:\n1 = Today {{slot_today}}\n2 = Tomorrow {{slot_tomorrow}}\n3 = Keep current time",
    variables: ['slot_today', 'slot_tomorrow'],
  },
  {
    id: '11',
    name: 'Pull-Forward Moved',
    category: 'SCHEDULING',
    content: "You’re moved to {{new_time_et}}. Calendar updated.",
    variables: ['new_time_et'],
  },
  {
    id: '12',
    name: 'Pull-Forward Keep Time',
    category: 'SCHEDULING',
    content:
      "Locked for {{day_time_et}}. Any reason you think you might miss it?",
    variables: ['day_time_et'],
  },
  {
    id: '13',
    name: 'Ghosting - Same Day',
    category: 'REMINDER',
    content: "Still good for {{time_et}} today?\n1 = Yes\n2 = Reschedule",
    variables: ['time_et'],
  },
  {
    id: '14',
    name: 'Ghosting - T-60 Reminder',
    category: 'REMINDER',
    content: "60 min until {{time_et}}.\n1 = Yes\n2 = Reschedule",
    variables: ['time_et'],
  },
  {
    id: '15',
    name: 'Ghosting - Next Day Confirm',
    category: 'REMINDER',
    content: "Confirming tomorrow at {{time_et}}.\n1 = Yes\n2 = Reschedule",
    variables: ['time_et'],
  },
  {
    id: '16',
    name: 'Ghosting - Last Chance',
    category: 'REMINDER',
    content:
      "Final check before we release your spot.\n1 = I’ll be there\n2 = Reschedule\n3 = Cancel",
    variables: [],
  },
  {
    id: '17',
    name: 'Ghosting - Released Spot',
    category: 'REMINDER',
    content:
      "We released {{time_et}} since we didn’t hear back. You can reschedule anytime here: {{manage_link}}",
    variables: ['time_et', 'manage_link'],
  },
  {
    id: '18',
    name: 'Auto-Reply - RESCHEDULE',
    category: 'AUTOREPLY',
    content:
      "I can get you in sooner:\n1 = Earliest today\n2 = Earliest tomorrow\n3 = Keep current time",
    variables: [],
  },
  {
    id: '19',
    name: 'Auto-Reply - CANCEL',
    category: 'AUTOREPLY',
    content:
      "Your spot has been released. You can rebook anytime here: {{manage_link}}",
    variables: ['manage_link'],
  },
  {
    id: '20',
    name: 'Auto-Reply - HELP',
    category: 'AUTOREPLY',
    content:
      "We are not a crisis line. For peer/affirming support (hours vary):\n• Call BlackLine at 800-604-5841\n• Text Thrive Lifeline at 313-662-8209\n• Call Trans Lifeline at 877-565-8860\n• Visit Fireweed Collective’s Crisis Toolkit: {{fireweed_link}}",
    variables: ['fireweed_link'],
  },
];
