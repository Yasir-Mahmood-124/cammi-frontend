// data.ts

export interface OnboardingQuestion {
  id: number;
  question: string;
  options: string[];
}

export const onboardingData: OnboardingQuestion[] = [
  {
    id: 1,
    question: "What brings you to Cammi today? (Select up to two)",
    options: [
      "Create strategic marketing plans and GTM documents",
      "Generate faster content (blogs, emails, posts)",
      "Manage and schedule content across platforms",
      "Track marketing performance and insights",
      "Plan business or campaign strategies",
      "Other",
    ],
  },
  {
    id: 2,
    question: "Who are you primarily using Cammi for?",
    options: [
    "	Myself (freelancer, consultant, or personal use)", 
    "My company or team", 
    "My clients (agency or contractor use)",
    "Education or training purposes"
  ],
  },
  {
    id: 3,
    question: "Which best describes your industry",
    options: [
      "Marketing /Creative / Agency",
      "SaaS / Tech",
      "E-commerce / Retail",
      "Logistics / Transportation",
      "Healthcare / Medical",
      "Education / Training",
      "Professional Services",
      "Other"
    ],
  },
  {
    id: 4,
    question: "How big is your company or team?",
    options: ["Just me", "2-10 people", "11-50 people", "51-500 people", "501-5,000 people", "5,000+ People"],
  },
  {
    id: 5,
    question: "What is your role in your company or team?",
    options: [
      "Founder / Owner / CEO",
      "Marketing Manager / Director",
      "Sales or RevOps Leader",
      "Content Creator/ Social Media Manager",
      "Freelancer / Consultant",
      "Other",
    ],
  },
  {
    id:6,
    question: "Which platforms would you like to connect Cammi to?",
    options: [
      "LinkedIn",
      "Instagram",
      "Facebook",
      "Google Ads",
      "HubSpot",
      "Other"
    ]
  },
  {
    id:7,
    question: "How experienced are you with AI marketing tools?",
    options: [
      "Beginner — I’m new to AI tools",
      "Intermediate — I’ve used AI for content or planning",
      "Advanced — I use AI regularly in my workflow",
    ]
  }
];
