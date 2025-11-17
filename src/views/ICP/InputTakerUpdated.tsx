"use client";

import React, { useRef, useEffect } from 'react';

interface InputItem {
  id: number;
  question: string;
  answer: string;
}

interface InputTakerProps {
  items: InputItem[];
  currentQuestionId: number;
  answeredIds: number[];
  onItemClick?: (id: number) => void;
  isClickable?: boolean;
}

// Question to Short Form mapping
const questionMapping: { [key: string]: string } = {
  // ICP Questions
  "Could you share the name of your business?": "Business Name",
  "If you had to explain your business in just a few sentences, how would you put it?": "Business Concept",
  "Who's buying from you right now—who's your main customer?": "Current Customer",
  "What are the top 3 wins you're aiming for in the next 12 months?": "12-Month Goals",
  "What's making it tough to find or convert the right customers?": "Customer Challenges",
  "Have you figured out who your dream customers or industries are yet?": "Best-Fit Customers",
  
  // KMF Questions
  "What industry would you say your business fits into?": "Industry",
  "What's the big goal you're working toward with your business?": "Business Goal",
  "Who are you hoping to reach—who's your ideal customer?": "Target Customer",
  "In the simplest way possible, how do you help your customers?": "Value Proposition",
  "Where do you see your business going in the long run?": "Long-Term Vision",
  "What pain points or challenges does your business solve for people?": "Problems Solved",
  "What are the main products or services you're offering?": "Core Offerings",
  "What sets you apart from others doing similar things?": "Unique Differentiator",
  "What kind of personality should your brand have? Professional? Friendly? Bold? Something else?": "Brand Tone",
  "Are there other values or themes you want people to connect with your brand?": "Brand Values",
  
  // SR Questions
  "What's the main benefit customers get from using your platform?": "Value Proposition",
  "How does your business make money? Subscription? Pay-per-use? Freemium?": "Business Model",
  "Where are most of your customers located—what's your main market?": "Geographic Focus",
  "Where does your pricing fall—are you budget-friendly, mid-range, or premium?": "Pricing Position",
  "What kind of budget are you working with for marketing?": "Marketing Budget",
  "Where are you at right now—just starting out, growing, scaling?": "Development Stage",
  "What's most important to you when it comes to building your user base?": "User Priorities",
  "What are you hoping to achieve with your marketing efforts?": "Marketing Objectives",
  "When are you thinking of kicking this project off?": "Start Date",
  "What's the big milestone or finish line you're working toward?": "End Date/Milestone",
  
  // BS Questions
  "Which customers are cool with being featured publicly?": "Approved Customers",
  "Got any links to customer video content we can use?": "Customer Videos",
  "Can you share links to any customer success stories or case studies?": "Case Studies",
  "What are some great quotes from happy customers you'd like to feature?": "Customer Quotes",
  "Do you have customer logos or other visuals we can showcase?": "Customer Logos",
  "What wins or achievements are you really proud of and want to show off?": "Achievements",
  "Who's going to be the voice and face representing your business?": "Spokesperson",
  "What's their role or title?": "Spokesperson Title",
  "Can you share your logo, product screenshots, or other brand visuals?": "Brand Assets",
  
  // GTM Questions
  "What's the one big thing you want to accomplish this year?": "One-Year Goal",
  "Fast forward three years—where do you see your business?": "Three-Year Vision",
  "What's your main priority right now in the short term?": "Short-Term Focus",
  "Tell us about your customers—who are they and where do they hang out?": "Customer Location",
  "What makes you different from everyone else in your space?": "Unique Factor",
  "What marketing tools or resources do you already have on hand?": "Marketing Tools",
  "What would you say are your biggest strengths, weaknesses, opportunities, and threats?": "SWOT",
  "Walk us through what you're offering—what's your product or service all about?": "Product/Service",
  
  // Common Questions
  "Who else is out there offering something similar to what you're doing?": "Competitors",
};

const InputTakerUpdated: React.FC<InputTakerProps> = ({ 
  items, 
  currentQuestionId,
  answeredIds,
  onItemClick,
  isClickable = true
}) => {
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper function to get the display text for a question
  const getDisplayQuestion = (question: string): string => {
    return questionMapping[question] || question;
  };

  // Auto-scroll to current question with more context (showing ~4 questions)
  useEffect(() => {
    const currentItemRef = itemRefs.current[currentQuestionId];
    if (currentItemRef && containerRef.current) {
      const container = containerRef.current;
      const itemRect = currentItemRef.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const itemHeight = 67;
      const scrollOffset = itemHeight * 1.5;
      
      const scrollTop = currentItemRef.offsetTop - container.offsetTop - scrollOffset;
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }
  }, [currentQuestionId]);

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div style={{ width: '100%', padding: '20px', fontFamily: 'Poppins, sans-serif', marginTop: '-18px' }}>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 600, 
        marginBottom: '24px',
        color: '#000'
      }}>
        Document Generation
      </h2>

      <div 
        ref={containerRef}
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '8px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1'
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            borderRadius: 10px;
          }
          div::-webkit-scrollbar-thumb {
            background: #888;
            borderRadius: 10px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}</style>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => {
            const isAnswered = answeredIds.includes(item.id);
            const isCurrent = item.id === currentQuestionId;
            const isActive = isAnswered || isCurrent;
            const displayQuestion = getDisplayQuestion(item.question);

            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                onClick={() => isClickable && onItemClick?.(item.id)}
                style={{
                  width: '247px',
                  height: '55px',
                  borderRadius: '12px',
                  background: isActive ? '#3EA3FF' : '#FAFAFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  opacity: isAnswered ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive && isClickable) {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && isClickable) {
                    e.currentTarget.style.background = '#FAFAFA';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: isActive ? '#fff' : '#000',
                    width: '20px'
                  }}>
                    {item.id}
                  </span>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isActive ? '#fff' : '#000',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '2px'
                    }}>
                      {truncateText(displayQuestion, 20)}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 400,
                      color: isActive ? 'rgba(255, 255, 255, 0.8)' : '#8A8A8A',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {isAnswered ? truncateText(item.answer, 22) : 'Not answered yet'}
                    </div>
                  </div>
                </div>

                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isActive ? '#fff' : '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isAnswered ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="#3EA3FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke={isActive ? '#3EA3FF' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InputTakerUpdated;