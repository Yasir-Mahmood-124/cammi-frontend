// DocumentQuestion.tsx
"use client";

import React from 'react';

interface DocumentQuestionProps {
  onYesClick: () => void;
  onNoClick: () => void;
  isLoading?: boolean;
}

const DocumentQuestion: React.FC<DocumentQuestionProps> = ({ 
  onYesClick, 
  onNoClick,
  isLoading = false 
}) => {
  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Document</h1>
      <p style={styles.subtitle}>Do you have a GTM Document?</p>
      <div style={styles.buttonContainer}>
        <button 
          style={styles.noButton} 
          onClick={onNoClick}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'No'}
        </button>
        <button 
          style={styles.yesButton} 
          onClick={onYesClick}
          disabled={isLoading}
        >
          Yes
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    margin: '0 auto',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '36px',
    fontWeight: 500,
    lineHeight: '24px',
    textAlign: 'center' as const,
    margin: '0 0 24px 0',
  },
  subtitle: {
    color: '#000',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '24px',
    fontWeight: 400,
    lineHeight: '24px',
    textAlign: 'center' as const,
    margin: '0 0 32px 0',
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  noButton: {
    borderRadius: '32px',
    border: '1px solid #3EA2FF',
    color: '#3EA2FF',
    backgroundColor: 'transparent',
    fontFamily: 'Poppins, sans-serif',
    padding: '12px 40px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  yesButton: {
    borderRadius: '32px',
    background: '#3EA2FF',
    color: '#fff',
    border: 'none',
    fontFamily: 'Poppins, sans-serif',
    padding: '12px 40px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default DocumentQuestion;