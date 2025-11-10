"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { setDisplayedContent as setIcpDisplayedContent } from '@/redux/services/icp/icpSlice';
import { setDisplayedContent as setKmfDisplayedContent } from '@/redux/services/kmf/kmfSlice';
import { setDisplayedContent as setBsDisplayedContent } from '@/redux/services/bs/bsSlice';
import { setDisplayedContent as setSrDisplayedContent } from '@/redux/services/sr/srSlice';
import { setDisplayedContent as setGtmDisplayedContent } from '@/redux/services/gtm/gtmSlice';
import { wsManager } from '@/redux/services/websocketManager';

interface GeneratingProps {
  wsUrl: string;
  documentType: 'icp' | 'kmf' | 'bs' | 'sr' | 'gtm';
}

const Generating: React.FC<GeneratingProps> = ({ wsUrl, documentType }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get state from Redux based on documentType
  const state = useSelector((state: RootState) => {
    if (documentType === 'icp') return state.icp;
    if (documentType === 'kmf') return state.kmf;
    if (documentType === 'bs') return state.bs;
    if (documentType === 'sr') return state.sr;
    return state.gtm;
  });
  
  const { 
    generatingProgress, 
    generatingContent, 
    displayedContent: reduxDisplayedContent,
    generationComplete 
  } = state;
  
  // Select the correct action based on documentType
  const setDisplayedContent = 
    documentType === 'icp' ? setIcpDisplayedContent :
    documentType === 'kmf' ? setKmfDisplayedContent :
    documentType === 'bs' ? setBsDisplayedContent :
    documentType === 'sr' ? setSrDisplayedContent :
    setGtmDisplayedContent;
  
  // Local state for typing effect
  const [localDisplayedContent, setLocalDisplayedContent] = useState("");
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  
  const typingInterval = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTypedLength = useRef(0);
  const isTypingActive = useRef(false);

  // Check if user is at the bottom
  const isAtBottom = () => {
    if (!contentRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    return scrollHeight - scrollTop - clientHeight < 50;
  };

  // Handle manual scroll
  const handleScroll = () => {
    if (!contentRef.current) return;
    
    const currentScrollTop = contentRef.current.scrollTop;
    const scrollingUp = currentScrollTop < lastScrollTop.current;
    
    isUserScrolling.current = true;
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    if (scrollingUp) {
      setAutoScroll(false);
    } else if (isAtBottom()) {
      setAutoScroll(true);
    }
    
    lastScrollTop.current = currentScrollTop;
    
    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 150);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && !isUserScrolling.current && contentRef.current) {
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
          lastScrollTop.current = contentRef.current.scrollTop;
        }
      });
    }
  }, [localDisplayedContent, autoScroll]);

  // Typing effect function
  const startTypingEffect = (targetContent: string, startFrom: number = 0) => {
    // Don't start if already typing
    if (isTypingActive.current) {
      console.log(`[${documentType.toUpperCase()} Generating] ⏭️ Already typing, skipping...`);
      return;
    }
    
    // Don't start if we're already at the target
    if (startFrom >= targetContent.length) {
      console.log(`[${documentType.toUpperCase()} Generating] ✓ Already at target length`);
      return;
    }
    
    console.log(`[${documentType.toUpperCase()} Generating] ⌨️ Starting typing from ${startFrom} to ${targetContent.length}`);
    isTypingActive.current = true;
    
    let currentIndex = startFrom;
    
    typingInterval.current = setInterval(() => {
      if (currentIndex < targetContent.length) {
        const newContent = targetContent.substring(0, currentIndex + 1);
        setLocalDisplayedContent(newContent);
        dispatch(setDisplayedContent(newContent));
        lastTypedLength.current = newContent.length;
        currentIndex++;
      } else {
        // Typing complete
        console.log(`[${documentType.toUpperCase()} Generating] ✓ Typing complete`);
        clearInterval(typingInterval.current!);
        typingInterval.current = null;
        isTypingActive.current = false;
      }
    }, 10); // 10ms per character
  };

  // Initialize on mount
  useEffect(() => {
    console.log(`[${documentType.toUpperCase()} Generating] 🔄 Component mounted`);
    console.log(`[${documentType.toUpperCase()} Generating] State check:`, {
      generationComplete,
      progress: generatingProgress,
      contentLength: generatingContent.length,
      displayedLength: reduxDisplayedContent.length
    });
    
    // If already complete, show all content immediately
    if (generationComplete || generatingProgress >= 100) {
      console.log(`[${documentType.toUpperCase()} Generating] ⚡ Already complete - showing all content`);
      setLocalDisplayedContent(generatingContent);
      setDisplayedProgress(generatingProgress);
      return;
    }
    
    // Restore displayed content from Redux
    if (reduxDisplayedContent && reduxDisplayedContent !== "Waiting for Document Generation...") {
      console.log(`[${documentType.toUpperCase()} Generating] 📦 Restoring content:`, reduxDisplayedContent.length, 'chars');
      setLocalDisplayedContent(reduxDisplayedContent);
      lastTypedLength.current = reduxDisplayedContent.length;
      
      // Continue typing if there's new content
      if (generatingContent.length > reduxDisplayedContent.length) {
        console.log(`[${documentType.toUpperCase()} Generating] ➕ Continuing typing from where we left off`);
        startTypingEffect(generatingContent, reduxDisplayedContent.length);
      }
    } else if (generatingContent !== "Waiting for Document Generation...") {
      console.log(`[${documentType.toUpperCase()} Generating] 🆕 Starting fresh typing`);
      setLocalDisplayedContent("");
      lastTypedLength.current = 0;
      startTypingEffect(generatingContent, 0);
    } else {
      setLocalDisplayedContent("Waiting for Document Generation...");
    }
    
    setDisplayedProgress(generatingProgress);
    
    // Cleanup
    return () => {
      console.log(`[${documentType.toUpperCase()} Generating] 🧹 Component unmounting`);
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
        typingInterval.current = null;
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      isTypingActive.current = false;
    };
  }, []);

  // Watch for new content
  useEffect(() => {
    const currentContent = generatingContent;
    const displayedLength = localDisplayedContent.length;
    
    if (currentContent === "Waiting for Document Generation...") {
      return;
    }
    
    // First real content
    if (localDisplayedContent === "Waiting for Document Generation..." && currentContent !== "Waiting for Document Generation...") {
      console.log(`[${documentType.toUpperCase()} Generating] 🆕 First real content, starting typing`);
      setLocalDisplayedContent("");
      lastTypedLength.current = 0;
      startTypingEffect(currentContent, 0);
      return;
    }
    
    // New content to type
    if (currentContent.length > displayedLength) {
      if (isTypingActive.current) {
        console.log(`[${documentType.toUpperCase()} Generating] ⏳ Currently typing, will catch up...`);
      } else {
        console.log(`[${documentType.toUpperCase()} Generating] ➕ New content detected, continuing from`, displayedLength);
        startTypingEffect(currentContent, displayedLength);
      }
    }
  }, [generatingContent]);

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = generatingProgress;
    const currentProgress = displayedProgress;
    const diff = targetProgress - currentProgress;
    
    if (Math.abs(diff) > 0.5) {
      const duration = 300;
      const steps = 20;
      const stepValue = diff / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayedProgress(targetProgress);
          clearInterval(interval);
        } else {
          setDisplayedProgress(prev => prev + stepValue);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    } else {
      setDisplayedProgress(targetProgress);
    }
  }, [generatingProgress]);

  // When complete, stop typing and show everything
  useEffect(() => {
    if (generationComplete || generatingProgress >= 100) {
      console.log(`[${documentType.toUpperCase()} Generating] 🎯 Completion detected - stopping typing`);
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
        typingInterval.current = null;
      }
      isTypingActive.current = false;
      setLocalDisplayedContent(generatingContent);
      setDisplayedProgress(100);
    }
  }, [generationComplete, generatingProgress, generatingContent]);

  const isTyping = isTypingActive.current;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Main Card */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#FAFAFA',
          border: '2px solid #D2D2D2',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontFamily: 'Poppins',
            fontSize: '20px',
            fontWeight: 600,
            color: '#000',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Generating Document
        </div>

        {/* Connection Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: wsManager.isConnected() ? '#4CAF50' : '#FF5252',
              animation: wsManager.isConnected() ? 'none' : 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <span style={{ fontFamily: 'Poppins', fontSize: '11px', color: '#666' }}>
            {wsManager.isConnected() ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        {/* Content Display */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'Poppins',
            fontSize: '12px',
            lineHeight: 1.6,
            color: '#333',
            paddingRight: '8px',
          }}
          className="custom-scrollbar"
        >
          {localDisplayedContent}
          {isTyping && (
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '14px',
                backgroundColor: '#3EA3FF',
                marginLeft: '2px',
                animation: 'blink 1s step-end infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 500, color: '#666' }}>
            {(generationComplete || generatingProgress >= 100) ? 'Document Generated Successfully!' : 'Document is generating, it can take a while'}
          </div>
          <div style={{ fontFamily: 'Poppins', fontSize: '12px', fontWeight: 600, color: '#3EA3FF' }}>
            {Math.round(displayedProgress)}%
          </div>
        </div>
        
        <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#E0E0E0', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${displayedProgress}%`,
              background: 'linear-gradient(90deg, #3EA3FF 0%, #FF3C80 100%)',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default Generating;