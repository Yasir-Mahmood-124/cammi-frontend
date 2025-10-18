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
  
  const pendingQueue = useRef<string[]>([]);
  const typingInterval = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Handle progress updates
        if (message.action === "sendMessage" && typeof message.body === "number") {
          setProgress(message.body);
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

        // Handle completion
        if (message.action === "sendMessage" && message.body === "Document generated successfully!") {
          console.log("✅ Document generation completed!");
          ws.close();
          setIsComplete(true);
          setProgress(100);
          if (onComplete) {
            onComplete();
          }
        }
      } catch (err) {
        console.error("❌ Failed parsing WS message", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      setDisplayedContent("WebSocket connection error.");
    };

    ws.onclose = (event) => {
      console.log("🔗 WebSocket closed:", event.code, event.reason);
    };

    return () => {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [wsUrl, onComplete]);

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