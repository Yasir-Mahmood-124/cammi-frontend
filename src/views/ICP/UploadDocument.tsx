// // UploadDocument.tsx
// "use client";

// import React, { useState, useEffect } from 'react';
// import { wsClient } from '@/redux/services/common/wsClient';
// import mammoth from 'mammoth';
// import Cookies from 'js-cookie';

// interface UploadDocumentProps {
//   document_type: string;
//   wsUrl: string;
//   onUploadComplete?: (data: any) => void;
// }

// const DocumentIcon = () => (
//   <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M50 10H20C17.7909 10 16 11.7909 16 14V66C16 68.2091 17.7909 70 20 70H60C62.2091 70 64 68.2091 64 66V24L50 10Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <path d="M50 10V24H64" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     <circle cx="56" cy="56" r="10" fill="#3EA2FF"/>
//     <path d="M56 52V60M52 56H60" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
//   </svg>
// );

// const UploadDocument: React.FC<UploadDocumentProps> = ({
//   document_type,
//   wsUrl,
//   onUploadComplete,
// }) => {
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [fileText, setFileText] = useState<string>("");
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   // Connect to WebSocket on mount
//   useEffect(() => {
//     // console.log('🔌 Connecting to WebSocket:', wsUrl);
//     wsClient.connect(wsUrl);

//     wsClient.onMessage((data: any) => {
//       // console.log('═══════════════════════════════════════════════════════');
//       // console.log('📨 WebSocket response received in UploadDocument:');
//       // console.log('═══════════════════════════════════════════════════════');
//       // console.log('Response:', data);
//       // console.log('───────────────────────────────────────────────────────');

//       if (onUploadComplete) {
//         onUploadComplete(data);
//       }

//       if (data.status === "processing_complete") {
//         setIsUploading(false);
//         // console.log('✅ Upload processing complete');
//         // console.log('═══════════════════════════════════════════════════════');
//       }
//     });
//   }, [wsUrl, onUploadComplete]);

//   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     // console.log('📁 File selection started...');
    
//     if (!event.target.files || event.target.files.length === 0) {
//       // console.log('❌ No file selected');
//       return;
//     }

//     const file = event.target.files[0];
//     const ext = file.name.split(".").pop()?.toLowerCase();

//     // console.log('📄 File selected:', file.name);
//     // console.log('📄 File extension:', ext);
//     // console.log('📄 File size:', file.size, 'bytes');

//     if (!["txt", "docx"].includes(ext || "")) {
//       const errorMsg = "Only .txt and .docx files are allowed.";
//       setError(errorMsg);
//       setFileName(null);
//       setFileText("");
//       // console.error('❌', errorMsg);
//       return;
//     }

//     setFileName(file.name);
//     setError("");

//     try {
//       let text = "";

//       if (ext === "txt") {
//         // console.log('📖 Reading .txt file...');
//         text = await file.text();
//         // console.log('✅ Text file read successfully. Length:', text.length);
//       } else if (ext === "docx") {
//         // console.log('📖 Reading .docx file...');
//         const arrayBuffer = await file.arrayBuffer();
//         const result = await mammoth.extractRawText({ arrayBuffer });
//         text = result.value;
//         // console.log('✅ DOCX file read successfully. Length:', text.length);
//       }

//       setFileText(text);
//       // console.log('📄 First 200 characters:', text.substring(0, 200) + '...');
//     } catch (err) {
//       // console.error("❌ Error extracting text:", err);
//       setError("Failed to extract text from file.");
//     }
//   };

//   const handleUpload = () => {
//     if (!fileText) {
//       // console.log('❌ No file text to upload');
//       setError("Please select a file first");
//       return;
//     }

//     // console.log('═══════════════════════════════════════════════════════');
//     // console.log('🚀 STARTING WEBSOCKET UPLOAD');
//     // console.log('═══════════════════════════════════════════════════════');

//     const session_id = Cookies.get("token");
//     const storedProject = typeof window !== "undefined" 
//       ? localStorage.getItem("currentProject") 
//       : null;
//     const project = storedProject ? JSON.parse(storedProject) : null;
//     const project_id = project?.project_id;

//     // console.log('📋 Configuration:');
//     // console.log('   - Session ID:', session_id ? `${session_id.substring(0, 20)}...` : 'MISSING!');
//     // console.log('   - Full Session ID Length:', session_id?.length);
//     // console.log('   - Project ID:', project_id);
//     // console.log('   - Document Type:', document_type);
//     // console.log('   - File Name:', fileName);
//     // console.log('   - WebSocket URL:', wsUrl);
//     // console.log('───────────────────────────────────────────────────────');

//     if (!session_id || !project_id) {
//       const errorMsg = "Missing session_id or project_id";
//       setError(errorMsg);
//       // console.error('❌', errorMsg);
//       alert(errorMsg + '\nPlease ensure you are logged in and a project is selected.');
//       return;
//     }

//     // Convert to bytes to measure size
//     const encoder = new TextEncoder();
//     const encoded = encoder.encode(fileText);

//     const MAX_SIZE = 90 * 1024; // 90KB safe margin
//     let safeText = fileText;

//     // console.log('📦 File Processing:');
//     // console.log('   - Original size:', encoded.length, 'bytes');
//     // console.log('   - Max allowed:', MAX_SIZE, 'bytes');

//     // Truncate if necessary
//     if (encoded.length > MAX_SIZE) {
//       // console.warn(`⚠️  File too large (${encoded.length} bytes). Truncating to ${MAX_SIZE} bytes.`);

//       let sliceLength = fileText.length;
//       while (encoder.encode(fileText.slice(0, sliceLength)).length > MAX_SIZE) {
//         sliceLength -= 1000;
//       }
//       safeText = fileText.slice(0, sliceLength);
//       // console.log('   - Truncated to:', encoder.encode(safeText).length, 'bytes');
//     } else {
//       // console.log('   - Size OK, no truncation needed');
//     }

//     const payload = {
//       action: "startProcessing",
//       session_id,
//       project_id,
//       document_type,
//       text: safeText,
//     };

//     // console.log('───────────────────────────────────────────────────────');
//     // console.log('📤 Sending payload via WebSocket:');
//     // console.log('   - Action:', payload.action);
//     // console.log('   - Session ID present:', !!payload.session_id);
//     // console.log('   - Project ID present:', !!payload.project_id);
//     // console.log('   - Document Type:', payload.document_type);
//     // console.log('   - Text length:', safeText.length, 'characters');
//     // console.log('   - Payload size:', encoder.encode(safeText).length, 'bytes');
//     // console.log('   - Full Payload (without text):', {
//     //   action: payload.action,
//     //   session_id: payload.session_id?.substring(0, 20) + '...',
//     //   project_id: payload.project_id,
//     //   document_type: payload.document_type,
//     //   text_length: safeText.length
//     // });
//     // console.log('═══════════════════════════════════════════════════════');

//     setIsUploading(true);
//     setError("");
    
//     try {
//       wsClient.send(payload);
//       // console.log('✅ Payload sent successfully. Waiting for response...');
//     } catch (err) {
//       // console.error('❌ Error sending WebSocket message:', err);
//       setError('Failed to send message. Please try again.');
//       setIsUploading(false);
//     }
//   };

//   const handleUploadClick = () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '.txt,.docx';
    
//     input.onchange = handleFileChange as any;
//     input.click();
//   };

//   return (
//     <div style={styles.card}>
//       <h1 style={styles.title}>Upload document</h1>
      
//       {error && (
//         <div style={styles.error}>
//           {error}
//         </div>
//       )}
      
//       <div style={styles.uploadContainer}>
//         <DocumentIcon />
        
//         {fileName && (
//           <div style={styles.fileName}>
//             Selected: {fileName}
//           </div>
//         )}
        
//         <button 
//           style={{
//             ...styles.uploadButton,
//             opacity: isUploading ? 0.6 : 1,
//             cursor: isUploading ? 'not-allowed' : 'pointer',
//           }} 
//           onClick={handleUploadClick}
//           disabled={isUploading}
//         >
//           {isUploading ? 'Processing...' : fileName ? 'Choose Different File' : 'Choose File'}
//         </button>
        
//         {fileName && fileText && (
//           <button 
//             style={{
//               ...styles.submitButton,
//               opacity: isUploading ? 0.6 : 1,
//               cursor: isUploading ? 'not-allowed' : 'pointer',
//             }} 
//             onClick={handleUpload}
//             disabled={isUploading}
//           >
//             {isUploading ? (
//               <span style={styles.uploadingText}>
//                 <span style={styles.spinner}></span>
//                 Uploading...
//               </span>
//             ) : (
//               'Upload & Process'
//             )}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// const styles: { [key: string]: React.CSSProperties } = {
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: '16px',
//     padding: '40px',
//     maxWidth: '600px',
//     width: '100%',
//     margin: '0 auto',
//     boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
//   },
//   title: {
//     color: '#000',
//     fontFamily: 'Poppins, sans-serif',
//     fontSize: '36px',
//     fontWeight: 500,
//     lineHeight: '24px',
//     textAlign: 'center' as const,
//     margin: '0 0 24px 0',
//   },
//   error: {
//     backgroundColor: '#fee',
//     color: '#c00',
//     padding: '12px',
//     borderRadius: '8px',
//     textAlign: 'center' as const,
//     fontFamily: 'Poppins, sans-serif',
//     fontSize: '14px',
//     marginBottom: '20px',
//   },
//   uploadContainer: {
//     display: 'flex',
//     flexDirection: 'column' as const,
//     alignItems: 'center',
//     marginTop: '40px',
//   },
//   fileName: {
//     fontFamily: 'Poppins, sans-serif',
//     fontSize: '14px',
//     color: '#666',
//     marginTop: '16px',
//     padding: '8px 16px',
//     backgroundColor: '#f5f5f5',
//     borderRadius: '8px',
//     wordBreak: 'break-word' as const,
//     maxWidth: '100%',
//   },
//   uploadButton: {
//     borderRadius: '32px',
//     background: '#3EA2FF',
//     color: '#fff',
//     border: 'none',
//     fontFamily: 'Poppins, sans-serif',
//     padding: '12px 40px',
//     fontSize: '16px',
//     marginTop: '24px',
//     cursor: 'pointer',
//     transition: 'all 0.3s ease',
//   },
//   submitButton: {
//     borderRadius: '32px',
//     background: 'linear-gradient(135deg, #3EA3FF, #FF3C80)',
//     color: '#fff',
//     border: 'none',
//     fontFamily: 'Poppins, sans-serif',
//     padding: '14px 48px',
//     fontSize: '16px',
//     fontWeight: 600,
//     marginTop: '16px',
//     cursor: 'pointer',
//     transition: 'all 0.3s ease',
//     boxShadow: '0 3px 8px rgba(62, 163, 255, 0.3)',
//   },
//   uploadingText: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//   },
//   spinner: {
//     width: '16px',
//     height: '16px',
//     border: '2px solid #fff',
//     borderTopColor: 'transparent',
//     borderRadius: '50%',
//     animation: 'spin 0.6s linear infinite',
//     display: 'inline-block',
//   },
// };

// // Add keyframes for spinner animation
// if (typeof document !== 'undefined') {
//   const style = document.createElement('style');
//   style.textContent = `
//     @keyframes spin {
//       to { transform: rotate(360deg); }
//     }
//   `;
//   document.head.appendChild(style);
// }

// export default UploadDocument;


// UploadDocument.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { wsClient } from '@/redux/services/common/wsClient';
import mammoth from 'mammoth';
import Cookies from 'js-cookie';

interface UploadDocumentProps {
  document_type: string;
  wsUrl: string;
  onUploadComplete?: (data: any) => void;
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
  document_type,
  wsUrl,
  onUploadComplete,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // 🔥 Track if component is mounted
  const isMounted = useRef(true);
  // 🔥 Store cleanup function
  const cleanupRef = useRef<(() => void) | null>(null);

  // 🔥 FIXED: Connect to WebSocket on mount with proper cleanup
  useEffect(() => {
    isMounted.current = true;
    console.log('🔌 [Upload] Setting up WebSocket for:', wsUrl);
    
    // Connect to WebSocket
    wsClient.connect(wsUrl);

    // 🔥 Register message handler and store cleanup function
    cleanupRef.current = wsClient.onMessage((data: any) => {
      // 🔥 Only process if component is still mounted
      if (!isMounted.current) {
        console.log('⚠️ [Upload] Component unmounted, ignoring message');
        return;
      }

      console.log('📨 [Upload] WebSocket response:', data);

      if (onUploadComplete) {
        onUploadComplete(data);
      }

      if (data.status === "processing_complete") {
        setIsUploading(false);
      }
      
      if (data.status === "error" || data.message === "Forbidden") {
        setIsUploading(false);
      }
    });

    // 🔥 CRITICAL: Cleanup on unmount
    return () => {
      console.log('🧹 [Upload] Cleaning up component');
      isMounted.current = false;
      
      // Remove this component's message listener
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [wsUrl, onUploadComplete]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!["txt", "docx"].includes(ext || "")) {
      const errorMsg = "Only .txt and .docx files are allowed.";
      setError(errorMsg);
      setFileName(null);
      setFileText("");
      return;
    }

    setFileName(file.name);
    setError("");

    try {
      let text = "";

      if (ext === "txt") {
        text = await file.text();
      } else if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      }

      setFileText(text);
    } catch (err) {
      console.error("❌ [Upload] Error extracting text:", err);
      setError("Failed to extract text from file.");
    }
  };

  const handleUpload = () => {
    if (!fileText) {
      setError("Please select a file first");
      return;
    }

    const session_id = Cookies.get("token");
    const storedProject = typeof window !== "undefined" 
      ? localStorage.getItem("currentProject") 
      : null;
    const project = storedProject ? JSON.parse(storedProject) : null;
    const project_id = project?.project_id;

    if (!session_id || !project_id) {
      const errorMsg = "Missing session_id or project_id";
      setError(errorMsg);
      alert(errorMsg + '\nPlease ensure you are logged in and a project is selected.');
      return;
    }

    // Convert to bytes to measure size
    const encoder = new TextEncoder();
    const encoded = encoder.encode(fileText);
    const MAX_SIZE = 90 * 1024;
    let safeText = fileText;

    if (encoded.length > MAX_SIZE) {
      let sliceLength = fileText.length;
      while (encoder.encode(fileText.slice(0, sliceLength)).length > MAX_SIZE) {
        sliceLength -= 1000;
      }
      safeText = fileText.slice(0, sliceLength);
    }

    const payload = {
      action: "startProcessing",
      session_id,
      project_id,
      document_type,
      text: safeText,
    };

    setIsUploading(true);
    setError("");
    
    try {
      // 🔥 Ensure connection before sending
      if (!wsClient.isConnected()) {
        console.log('⚠️ [Upload] WebSocket not connected, reconnecting...');
        wsClient.connect(wsUrl);
        setTimeout(() => {
          wsClient.send(payload);
        }, 500);
      } else {
        wsClient.send(payload);
      }
      
      console.log('✅ [Upload] Payload sent');
    } catch (err) {
      console.error('❌ [Upload] Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.docx';
    input.onchange = handleFileChange as any;
    input.click();
  };

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Upload document</h1>
      
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}
      
      <div style={styles.uploadContainer}>
        <DocumentIcon />
        
        {fileName && (
          <div style={styles.fileName}>
            Selected: {fileName}
          </div>
        )}
        
        <button 
          style={{
            ...styles.uploadButton,
            opacity: isUploading ? 0.6 : 1,
            cursor: isUploading ? 'not-allowed' : 'pointer',
          }} 
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? 'Processing...' : fileName ? 'Choose Different File' : 'Choose File'}
        </button>
        
        {fileName && fileText && (
          <button 
            style={{
              ...styles.submitButton,
              opacity: isUploading ? 0.6 : 1,
              cursor: isUploading ? 'not-allowed' : 'pointer',
            }} 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <span style={styles.uploadingText}>
                <span style={styles.spinner}></span>
                Uploading...
              </span>
            ) : (
              'Upload & Process'
            )}
          </button>
        )}
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
  error: {
    backgroundColor: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
    marginBottom: '20px',
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: '40px',
  },
  fileName: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
    color: '#666',
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    wordBreak: 'break-word' as const,
    maxWidth: '100%',
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
  submitButton: {
    borderRadius: '32px',
    background: 'linear-gradient(135deg, #3EA3FF, #FF3C80)',
    color: '#fff',
    border: 'none',
    fontFamily: 'Poppins, sans-serif',
    padding: '14px 48px',
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 3px 8px rgba(62, 163, 255, 0.3)',
  },
  uploadingText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #fff',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  },
};

// Add keyframes for spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default UploadDocument;