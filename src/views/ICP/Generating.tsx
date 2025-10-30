"use client";

import React, { useState, useEffect, useRef } from 'react';

interface GeneratingProps {
  wsUrl: string;
  onComplete?: () => void;
}

const Generating: React.FC<GeneratingProps> = ({ wsUrl, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState("Waiting for Document Generation...");
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true); // Track auto-scroll state
  
  const pendingQueue = useRef<string[]>([]);
  const typingInterval = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hasCalledComplete = useRef(false); // Prevent duplicate calls
  const contentRef = useRef<HTMLDivElement>(null); // Ref for auto-scroll
  const lastScrollTop = useRef(0); // Track last scroll position
  const isUserScrolling = useRef(false); // Track if user is actively scrolling
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Check if user is at the bottom of the scroll container
  const isAtBottom = () => {
    if (!contentRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    // Consider "at bottom" if within 50px of the bottom
    return scrollHeight - scrollTop - clientHeight < 50;
  };

  // Handle manual scroll by user
  const handleScroll = () => {
    if (!contentRef.current) return;
    
    const currentScrollTop = contentRef.current.scrollTop;
    const scrollingUp = currentScrollTop < lastScrollTop.current;
    
    // Mark as user scrolling
    isUserScrolling.current = true;
    
    // Clear previous timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    // If user scrolled up, immediately disable auto-scroll
    if (scrollingUp) {
      setAutoScroll(false);
    } else {
      // If scrolling down, check if at bottom
      const atBottom = isAtBottom();
      if (atBottom) {
        setAutoScroll(true);
      }
    }
    
    lastScrollTop.current = currentScrollTop;
    
    // Reset user scrolling flag after scroll ends
    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 150);
  };

  // Auto-scroll effect - only scrolls if autoScroll is true and user is not scrolling
  useEffect(() => {
    if (autoScroll && !isUserScrolling.current && contentRef.current) {
      // Use requestAnimationFrame for smoother scroll
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
          lastScrollTop.current = contentRef.current.scrollTop;
        }
      });
    }
  }, [displayedContent, autoScroll]);

  // Typing effect function
  const startTyping = (text: string) => {
    if (typingInterval.current) {
      clearInterval(typingInterval.current);
      typingInterval.current = null;
    }

    let i = 0;
    typingInterval.current = setInterval(() => {
      setDisplayedContent((prev) => prev + text[i]);
      i++;

      if (i >= text.length) {
        clearInterval(typingInterval.current!);
        typingInterval.current = null;

        if (pendingQueue.current.length > 0) {
          const nextMsg = pendingQueue.current.shift()!;
          startTyping("\n\n" + nextMsg);
        }
      }
    }, 15);
  };

  // Function to trigger completion
  const triggerCompletion = () => {
    if (!hasCalledComplete.current) {
      hasCalledComplete.current = true;
      // console.log("✅ Document generation completed! Triggering onComplete callback...");
      setIsComplete(true);
      setProgress(100);
      
      // Close WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      // Call the completion callback with a small delay for better UX
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }
  };

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Handle progress updates
        if (message.action === "sendMessage" && typeof message.body === "number") {
          const newProgress = message.body;
          setProgress(newProgress);
          
          // Check if progress reached 100%
          if (newProgress >= 100) {
            triggerCompletion();
          }
          return;
        }

        // Handle tier completion messages
        if (message.type === "tier_completion" && message.data?.content?.content) {
          const newContent = message.data.content.content;

          if (typingInterval.current) {
            pendingQueue.current.push(newContent);
          } else {
            startTyping(
              displayedContent === "Waiting for Document Generation..."
                ? newContent
                : "\n\n" + newContent
            );
          }
        }

        // Handle completion message
        if (message.action === "sendMessage" && message.body === "Document generated successfully!") {
          triggerCompletion();
        }

        // Handle completion status
        if (message.status === "completed" || message.status === "complete") {
          triggerCompletion();
        }
      } catch (err) {
        // console.error("❌ Failed parsing WS message", err);
      }
    };

    ws.onerror = (err) => {
      // console.error("❌ WebSocket error:", err);
      setDisplayedContent("WebSocket connection error.");
    };

    ws.onclose = (event) => {
      // console.log("🔗 WebSocket closed:", event.code, event.reason);
      
      // If connection closed and progress is 100%, ensure completion is triggered
      if (progress >= 100 || isComplete) {
        triggerCompletion();
      }
    };

    return () => {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [wsUrl]);

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
      {/* Main Card with Content */}
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

        {/* Content Display Area */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            whiteSpace: 'pre-line',
            fontFamily: 'Poppins',
            fontSize: '12px',
            lineHeight: 1.6,
            color: '#333',
            paddingRight: '8px',
          }}
          className="custom-scrollbar"
        >
          {displayedContent}
        </div>
      </div>

      {/* Progress Bar - Below the Main Card */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div
            style={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: 500,
              color: '#666',
            }}
          >
            {isComplete ? 'Document Generated Successfully!' : 'Document is generating it can take a while'}
          </div>
          <div
            style={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontWeight: 600,
              color: '#3EA3FF',
            }}
          >
            {progress.toFixed(0)}%
          </div>
        </div>
        
        <div
          style={{
            height: '8px',
            borderRadius: '4px',
            backgroundColor: '#E0E0E0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3EA3FF 0%, #FF3C80 100%)',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Generating;