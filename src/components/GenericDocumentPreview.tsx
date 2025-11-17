import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface GenericDocumentPreviewProps {
  /** Base64 encoded DOCX content */
  docxBase64: string;
  
  /** Optional custom title for the document */
  title?: string;
  
  /** Optional file name for downloads */
  fileName?: string;
  
  /** Callback when download is requested */
  onDownload?: () => Promise<void> | void;
  
  /** Callback when close button is clicked */
  onClose?: () => void;
  
  /** Loading state for download */
  isDownloading?: boolean;
}

const GenericDocumentPreview: React.FC<GenericDocumentPreviewProps> = ({
  docxBase64,
  title = 'Your Document is Generated',
  fileName = 'document.docx',
  onDownload,
  onClose,
  isDownloading = false,
}) => {
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [documentHtml, setDocumentHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parse DOCX and extract content
  useEffect(() => {
    const parseDocx = async () => {
      try {
        setIsLoading(true);
        const mammoth = await import('mammoth');
        
        // Convert base64 to array buffer
        const binaryString = atob(docxBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert to HTML
        const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
        
        // Parse HTML and create table of contents
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        const toc: TableOfContentsItem[] = [];
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName.substring(1));
          const text = heading.textContent || '';
          const id = `heading-${index}`;
          heading.id = id;
          toc.push({ id, text, level });
        });
        
        setDocumentHtml(doc.body.innerHTML);
        setTableOfContents(toc);
        
        if (toc.length > 0) {
          setActiveSection(toc[0].id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing DOCX:', error);
        toast.error('Failed to parse document');
        setIsLoading(false);
      }
    };

    if (docxBase64) {
      parseDocx();
    }
  }, [docxBase64]);

  // Handle scroll for active section tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const scrollPosition = contentRef.current.scrollTop + 100;

      for (let i = tableOfContents.length - 1; i >= 0; i--) {
        const element = contentRef.current.querySelector(`#${tableOfContents[i].id}`) as HTMLElement;
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(tableOfContents[i].id);
          break;
        }
      }
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [tableOfContents]);

  const handleDownloadClick = async () => {
    if (onDownload) {
      try {
        await onDownload();
        toast.success('Document downloaded successfully!');
      } catch (error) {
        console.error('Failed to download document:', error);
        toast.error('Failed to download document');
      }
    } else {
      toast.error('Download functionality not configured');
    }
  };

  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    
    if (contentRef.current) {
      const element = contentRef.current.querySelector(`#${id}`) as HTMLElement;
      
      if (element) {
        const elementTop = element.offsetTop;
        
        contentRef.current.scrollTo({
          top: elementTop - 20,
          behavior: 'smooth'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#EFF1F5'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#EFF1F5',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        padding: '16px 40px',
        backgroundColor: '#EFF1F5',
        flexShrink: 0
      }}>
        <Typography sx={{ 
          fontFamily: 'Poppins',
          fontSize: '20px',
          fontWeight: 600,
          color: '#333',
          textAlign: 'center'
        }}>
          {title}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        gap: '20px',
        padding: '16px 40px',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {/* Table of Contents - Left Side */}
        <Box sx={{ 
          width: '280px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <Typography sx={{ 
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 600,
            color: '#333',
            marginBottom: '12px',
            paddingBottom: '10px',
            borderBottom: '2px solid #3EA3FF'
          }}>
            Document tabs
          </Typography>
          
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F5F5F5',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#CCCCCC',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: '#AAAAAA',
              },
            },
          }}>
            {tableOfContents.map((item) => (
              <Box
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                sx={{
                  padding: '10px 12px',
                  paddingLeft: `${12 + (item.level - 1) * 16}px`,
                  marginBottom: '4px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  backgroundColor: activeSection === item.id ? '#E3F2FD' : 'transparent',
                  borderLeft: activeSection === item.id ? '3px solid #3EA3FF' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                  },
                }}
              >
                <Typography sx={{
                  fontFamily: 'Poppins',
                  fontSize: item.level === 1 ? '13px' : '12px',
                  fontWeight: item.level === 1 ? 600 : 400,
                  color: activeSection === item.id ? '#3EA3FF' : '#555',
                  lineHeight: '1.4',
                }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Document Content - Right Side */}
        <Box 
          ref={contentRef}
          sx={{ 
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflowY: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F5F5F5',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#CCCCCC',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#AAAAAA',
              },
            },
          }}>
          <Box 
            sx={{
              fontFamily: 'Poppins',
              '& h1': {
                fontFamily: 'Poppins',
                fontSize: '24px',
                fontWeight: 700,
                color: '#333',
                marginBottom: '12px',
                marginTop: '16px',
                scrollMarginTop: '20px',
              },
              '& h2': {
                fontFamily: 'Poppins',
                fontSize: '18px',
                fontWeight: 600,
                color: '#3EA3FF',
                marginBottom: '10px',
                marginTop: '14px',
                scrollMarginTop: '20px',
              },
              '& h3': {
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: '#555',
                marginBottom: '10px',
                marginTop: '12px',
                scrollMarginTop: '20px',
              },
              '& h4, & h5, & h6': {
                fontFamily: 'Poppins',
                fontWeight: 600,
                color: '#555',
                marginBottom: '8px',
                marginTop: '10px',
                scrollMarginTop: '20px',
              },
              '& p': {
                fontFamily: 'Poppins',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#666',
                marginBottom: '10px',
              },
              '& ul, & ol': {
                fontFamily: 'Poppins',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#666',
                marginLeft: '20px',
                marginBottom: '10px',
              },
              '& strong': {
                fontWeight: 600,
                color: '#333',
              },
            }}
            dangerouslySetInnerHTML={{ __html: documentHtml }}
          />
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        padding: '12px 40px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E0E0E0',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {/* Download Button */}
        <Button
          variant="outlined"
          onClick={handleDownloadClick}
          disabled={isDownloading}
          sx={{
            fontFamily: 'Poppins',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 20px',
            borderRadius: '6px',
            border: '2px solid #3EA3FF',
            backgroundColor: '#FFF',
            color: '#000',
            textTransform: 'none',
            '&:hover': {
              border: '2px solid #3EA3FF',
              backgroundColor: '#F8F8F8',
            },
            '&:disabled': {
              border: '2px solid #ccc',
              backgroundColor: '#F5F5F5',
              color: '#999',
            },
          }}
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>

        {/* Close Button with Gradient Border */}
        <Box
          sx={{
            position: 'relative',
            padding: '2px',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, #FF3D81 0%, #3FA3FF 100%)',
          }}
        >
          <Button
            variant="text"
            startIcon={<CloseIcon />}
            onClick={handleCloseClick}
            sx={{
              fontFamily: 'Poppins',
              fontSize: '13px',
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: '4px',
              backgroundColor: '#FFF',
              color: '#000',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#F8F8F8',
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GenericDocumentPreview;