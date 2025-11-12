// data.ts
export interface UnifiedDocumentData {
  [documentType: string]: {
    [mainHeading: string]: string[];
  };
}

export const unifiedHeadingData: UnifiedDocumentData = {
  gtm: {
    "Business Foundation": [
      "Mission Statement",
      "Vision Statement",
      "Business Description",
      "Core Problems This Business Solves",
      "Explanation of Business Model",
      "Value Proposition",
      "Value Proposition Short",
      "What is Success for This Business",
      "Business Goals",
      "Metrics that Matter (KPIs)",
    ],
    "Market Research & Insights": [
      "Needs Analysis",
      "Market Size Analysis",
      "Market Trend Analysis",
      "Competitive Analysis",
      "Market Research Summary",
    ],
    "Audience Persona & Behavioral Insights": [
      "Target Market",
      "Ideal Customer Profile: Champion",
      "Ideal Customer Profile: Decision Maker",
      "Ideal Customer Profile: Influencer",
      "Ideal Customer Profile: Blockers",
      "Customer Journey",
    ],
    "Brand Identity & Messaging": [
      "Brand Name",
      "Tag Line",
      "Imagery",
      "Voice and Tone",
      "Brand Guidelines",
      "Brand Position",
    ],
    "Messaging & Communication Framework": [
      "Unique Selling Proposition",
      "Features",
      "Benefits",
      "Story Telling",
      "Clear Call to Action",
      "Irresistible Offer",
    ],
    "Marketing Strategy & Execution Plan": [
      "Situational Analysis",
      "Marketing Objectives",
      "Marketing Strategies",
      "Tactics and Action Plans",
      "Performance Metrics and KPI's",
      "Influencer Strategy",
    ],
    "Social Media Content Plan": [
      "Content Pillars",
      "Content Pillar 1 (10 Ideas)",
      "Content Pillar 2 (10 Ideas)",
      "Content Pillar 3 (10 Ideas)",
      "Content Pillar 4 (10 Ideas)",
      "Content Pillar 5 (10 Ideas)",
    ],
    "Sales & PR Strategy": [
      "Sales Channels",
      "Go to Market Strategy",
      "PR Strategy",
      "Strategic Partner Strategy",
      "PR Boiler Plate",
    ],
    "Growth & Fundraising": [
      "Fastest Way to First 100 Customers",
      "Business Model Risks",
    ],
    "Inspirational Insights": [
      "Advice from Steve Jobs",
      "Advice from Elon Musk",
      "Advice from Jeff Bezos",
      "Advice from Peter Thiel",
      "Advice from Mark Zuckerberg",
      "Advice from Paul Graham",
      "Advice from Ried Hoffman",
      "Advice from Niel Patel",
    ],
  },
  icp: {
    ICP: [
      "Introduction",
      "Customer Analysis",
      "Problem & Solution Fit",
      "Segmentation",
      "Ideal Customer Profile",
      "Negative ICP",
      "Validation",
      "Action Plan",
    ],
  },
  kmf: {
    KMF: [
      "Company Overview",
      "About the Company",
      "Messaging Pillars",
      "Segments & Messaging",
      "Additional Messaging",
      "Branding Details",
      "Key Messaging",
    ],
  },
  bs: {
    BS: [
      "Positioning Canvas",
      "Boilerplate Messaging",
      "Competitive Messaging",
      "Approved Customer Assets",
      "Brag Points",
      "Spokeperson Bios",
      "Approved Visual Assets",
    ],
  },
  sr: {
    SR: [
      "Target Market",
      "SWOT Analysis",
      "Key Product Features",
      "Product Roadmap",
      "Overall Business Goals",
      "Marketing Objectives",
      "Quaterly Breakdown",
      "Revenue Objective",
    ],
  },
};

// Helper function to get document type display name
export const getDocumentTypeDisplayName = (docType: string): string => {
  const displayNames: { [key: string]: string } = {
    gtm: "Go-To-Market",
    icp: "Ideal Customer Profile",
    kmf: "Key Messaging Framework",
    bs: "Brand Story",
    sr: "Strategic Roadmap",
  };
  return displayNames[docType.toLowerCase()] || docType.toUpperCase();
};