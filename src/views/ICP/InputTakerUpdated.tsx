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
  "What is the name of your business?": "Business Name",
  "How would you describe your business concept in a few sentences?": "Business Concept",
  "Who is your main customer right now?": "Current Customer",
  "What are the top 3 goals you want to hit in the next 12 months?": "12-Month Goals",
  "What challenges are you facing in finding or converting customers?": "Customer Challenges",
  "Do you already know your best-fit customers or industries?": "Best-Fit Customers",
  
  // KMF Questions
  "Which industry does your business belong to?": "Industry",
  "What is the main objective or goal of your business?": "Business Goal",
  "Who is your target market or ideal customer?": "Target Customer",
  "What is your short value proposition (how you help customers in a simple way)?": "Value Proposition",
  "What is the long-term vision for your business?": "Long-Term Vision",
  "What key problems does your business solve for customers?": "Problems Solved",
  "What are the core products or services your business offers?": "Core Offerings",
  "What makes your business unique compared to competitors?": "Unique Differentiator",
  "What tone or personality should your brand convey (e.g., professional, friendly, innovative)?": "Brand Tone",
  "Are there any additional themes or values you want associated with your brand?": "Brand Values",
  
  // SR Questions
  "What is your value proposition (the main benefit your platform offers customers)?": "Value Proposition",
  "What is your business model (e.g., subscription, pay-per-download, freemium)?": "Business Model",
  "What is your primary geographic market focus?": "Geographic Focus",
  "How do you position your pricing (e.g., low-tier, mid-tier, premium)?": "Pricing Position",
  "What is your estimated marketing budget?": "Marketing Budget",
  "What stage of development is your business currently in?": "Development Stage",
  "What are your top user development priorities?": "User Priorities",
  "What are your key marketing objectives?": "Marketing Objectives",
  "When do you plan to start this project?": "Start Date",
  "When is your planned end date or long-term milestone?": "End Date/Milestone",
  
  // BS Questions
  "Which customers are approved to be publicly showcased?": "Approved Customers",
  "Can you provide links to approved customer video assets?": "Customer Videos",
  "Can you provide links to approved customer case studies?": "Case Studies",
  "What are the approved customer quotes you want to feature?": "Customer Quotes",
  "Can you provide links to approved customer logos or other visual assets?": "Customer Logos",
  "What brag points or achievements would you like to highlight?": "Achievements",
  "Who will act as the spokesperson for your business?": "Spokesperson",
  "What is the spokesperson’s title or role?": "Spokesperson Title",
  "Can you provide links to your brand’s visual assets (e.g., logo, product screenshots)?": "Brand Assets",
  
  // GTM Questions
  "What do you want to accomplish in one year?": "One-Year Goal",
  "Where do you want to be in three years?": "Three-Year Vision",
  "Where is your short term focus?": "Short-Term Focus",
  "Tell us about who you sell to? Where are they located?": "Customer Location",
  "What is unique about your business?": "Unique Factor",
  "What marketing tools do you have available to you?": "Marketing Tools",
  "What are your strengths, weaknesses, opps and threats?": "SWOT",
  "Tell us about your product/solution/service?": "Product/Service",
  
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