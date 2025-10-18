// UploadDocument.tsx
"use client";

import React from 'react';

interface UploadDocumentProps {
  onUpload?: (file: File) => void;
  projectId: string;
  documentType: string;
}

const DocumentIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10H20C17.7909 10 16 11.7909 16 14V66C16 68.2091 17.7909 70 20 70H60C62.2091 70 64 68.2091 64 66V24L50 10Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 10V24H64" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="56" cy="56" r="10" fill="#3EA2FF"/>
    <path d="M56 52V60M52 56H60" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const UploadDocument: React.FC<UploadDocumentProps> = ({ 
  onUpload,
  projectId,
  documentType 
}) => {
  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && onUpload) {
        onUpload(file);
      }
    };
    
    input.click();
  };

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Upload document</h1>
      <div style={styles.uploadContainer}>
        <DocumentIcon />
        <button style={styles.uploadButton} onClick={handleUpload}>
          Upload
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
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: '40px',
  },
  uploadButton: {
    borderRadius: '32px',
    background: '#3EA2FF',
    color: '#fff',
    border: 'none',
    fontFamily: 'Poppins, sans-serif',
    padding: '12px 40px',
    fontSize: '16px',
    marginTop: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default UploadDocument;
