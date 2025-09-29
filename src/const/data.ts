// data.ts

export interface OnboardingQuestion {
  id: number;
  question: string;
  options: string[];
}

export const onboardingData: OnboardingQuestion[] = [
  {
    id: 1,
    question: "How do you plan to do with Cammi?",
    options: [
      "Strategic Document Generation",
      "Content Creation and SEO",
      "Business Planning",
      "Publishing & Scheduling",
      "Performance Tracking",
      "Other",
    ],
  },
  {
    id: 2,
    question: "How do you plan to use Cammi?",
    options: ["For Personal Use", "For Education", "For Organization"],
  },
  {
    id: 3,
    question: "What type of business do you represent?",
    options: [
      "Healthcare/ Medicine",
      "Design/ Creative Agency",
      "E-commerce",
      "SaaS/ Tech",
      "Education",
      "Other",
    ],
  },
  {
    id: 4,
    question: "How many people work at your organization?",
    options: ["Just me", "2-10", "11-50", "51-500", "501-5000", "Other"],
  },
  {
    id: 5,
    question: "Which platform do you want to connect?",
    options: [
      "Facebook",
      "Instagram",
      "LinkedIn",
      "Google Ads",
      "Meta",
      "Other",
    ],
  },
];
