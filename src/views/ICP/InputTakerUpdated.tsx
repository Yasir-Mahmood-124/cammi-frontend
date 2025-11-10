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
  isClickable?: boolean; // New prop to control clickability
}

const InputTakerUpdated: React.FC<InputTakerProps> = ({ 
  items, 
  currentQuestionId,
  answeredIds,
  onItemClick,
  isClickable = true // Default to clickable
}) => {
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current question with more context (showing ~4 questions)
  useEffect(() => {
    const currentItemRef = itemRefs.current[currentQuestionId];
    if (currentItemRef && containerRef.current) {
      const container = containerRef.current;
      const itemRect = currentItemRef.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate the scroll position to center the current item with more context
      // Each item is ~55px height + 12px gap = 67px per item
      // To show 4 items, we need about 268px visible area
      const itemHeight = 67; // 55px height + 12px gap
      const scrollOffset = itemHeight * 1.5; // Offset to show more context above
      
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
                      {truncateText(item.question, 20)}
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