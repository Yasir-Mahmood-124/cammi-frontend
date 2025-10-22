export interface SectionItem {
  title: string;
}

export interface SectionData {
  section: string;
  items: SectionItem[];
}

export const sectionsData: SectionData[] = [
  {
    section: "icp",
    items: [
      { title: "Introduction" },
      { title: "Customer Analysis" },
      { title: "Problem & Solution Fit" },
      { title: "Segmentation" },
      { title: "Ideal Customer Profile" },
      { title: "Negative ICP" },
      { title: "Validation" },
      { title: "Action Plan" },
    ],
  },
  {
    section: "kmf",
    items: [
      { title: "Company Overview" },
      { title: "About the Company" },
      { title: "Messaging Pillars" },
      { title: "Segments & Messaging" },
      { title: "Additional Messaging" },
      { title: "Branding Details" },
      { title: "Key Messaging" },
    ],
  },
  {
    section: "bs",
    items: [
      { title: "Positioning Canvas" },
      { title: "Boilerplate Messaging" },
      { title: "Competitive Messaging" },
      { title: "Approved Customer Assets" },
      { title: "Brag Points" },
      { title: "Spokeperson Bios" },
      { title: "Approved Visual Assets" },
    ],
  },
  {
    section: "sr",
    items: [
      { title: "Target Market" },
      { title: "SWOT Analysis" },
      { title: "Key Product Features" },
      { title: "Product Roadmap" },
      { title: "Overall Business Goals" },
      { title: "Marketing Objectives" },
      { title: "Quaterly Breakdown" },
      { title: "Revenue Objective" },
    ],
  },
];