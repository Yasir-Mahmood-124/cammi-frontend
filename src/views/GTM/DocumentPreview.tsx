import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Menu, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useDownloadPdfMutation } from '@/redux/services/document/download-pdf';
import Cookies from 'js-cookie';

interface DocumentPreviewProps {
  docxBase64: string;
  fileName: string;
}

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ docxBase64, fileName }) => {
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [documentHtml, setDocumentHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'DOCx'>('DOCx');
  const open = Boolean(anchorEl);

  const [downloadPdf, { isLoading: isPdfLoading }] = useDownloadPdfMutation();

  useEffect(() => {
    const parseDocx = async () => {
      try {
        // Dynamically import mammoth
        const mammoth = await import('mammoth');
        
        // Convert base64 to array buffer
        const binaryString = atob(docxBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert to HTML
        const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
        setDocumentHtml(result.value);
        
        // Extract table of contents from the HTML
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
        
        setTableOfContents(toc);
        if (toc.length > 0) {
          setActiveSection(toc[0].id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing DOCX:', error);
        setIsLoading(false);
      }
    };

    parseDocx();
  }, [docxBase64]);

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFormatSelect = async (format: 'PDF' | 'DOCx') => {
    setSelectedFormat(format);
    handleMenuClose();

    if (format === 'DOCx') {
      handleDownloadDocx();
    } else if (format === 'PDF') {
      await handleDownloadPdf();
    }
  };

  const handleDownloadDocx = () => {
    const binaryString = atob(docxBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      const response = await downloadPdf({
        session_id: savedToken || '',
        project_id: project_id,
        document_type: 'gtm',
      }).unwrap();

      // Convert base64 PDF to blob and download
      const binaryString = atob(response.base64_pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download PDF:', error);
    }
  };

  const handleEdit = () => {
    console.log('Edit functionality to be implemented');
    // Implement edit functionality
  };

  const handleSubmitForReview = () => {
    console.log('Submit for review functionality to be implemented');
    // Implement submit for review functionality
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    
    // Find the element in the document content area
    const documentContainer = document.querySelector('[data-document-content]');
    const element = documentContainer?.querySelector(`#${id}`);
    
    if (element && documentContainer) {
      // Get the position of the element relative to the container
      const elementTop = (element as HTMLElement).offsetTop;
      
      // Scroll the container to the element with smooth behavior
      documentContainer.scrollTo({
        top: elementTop - 20, // 20px offset from top for better visibility
        behavior: 'smooth'
      });
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
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#EFF1F5',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        padding: '20px 40px',
        backgroundColor: '#EFF1F5',
        borderBottom: '1px solid #E0E0E0'
      }}>
        <Typography sx={{ 
          fontFamily: 'Poppins',
          fontSize: '24px',
          fontWeight: 600,
          color: '#333',
          textAlign: 'center'
        }}>
          Your Document is Generated
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        gap: '20px',
        padding: '20px 40px',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {/* Table of Contents - Left Side */}
        <Box sx={{ 
          width: '280px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Typography sx={{ 
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 600,
            color: '#333',
            marginBottom: '16px',
            paddingBottom: '12px',
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
          data-document-content
          sx={{ 
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '40px',
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
                fontSize: '28px',
                fontWeight: 700,
                color: '#333',
                marginBottom: '16px',
                marginTop: '24px',
                scrollMarginTop: '20px',
              },
              '& h2': {
                fontFamily: 'Poppins',
                fontSize: '22px',
                fontWeight: 600,
                color: '#3EA3FF',
                marginBottom: '14px',
                marginTop: '20px',
                scrollMarginTop: '20px',
              },
              '& h3': {
                fontFamily: 'Poppins',
                fontSize: '18px',
                fontWeight: 600,
                color: '#555',
                marginBottom: '12px',
                marginTop: '16px',
                scrollMarginTop: '20px',
              },
              '& h4, & h5, & h6': {
                fontFamily: 'Poppins',
                fontWeight: 600,
                color: '#555',
                marginBottom: '10px',
                marginTop: '14px',
                scrollMarginTop: '20px',
              },
              '& p': {
                fontFamily: 'Poppins',
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#666',
                marginBottom: '12px',
              },
              '& ul, & ol': {
                fontFamily: 'Poppins',
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#666',
                marginLeft: '20px',
                marginBottom: '12px',
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
        padding: '20px 40px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E0E0E0',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        alignItems: 'center'
      }}>
        {/* Download Button with Dropdown */}
        <Box sx={{ position: 'relative' }}>
          <Button
            variant="outlined"
            endIcon={<KeyboardArrowUpIcon sx={{ 
              fontSize: '20px',
              backgroundColor: '#000',
              color: '#FFF',
              borderRadius: '50%',
              padding: '2px'
            }} />}
            onClick={handleDownloadClick}
            disabled={isPdfLoading}
            sx={{
              fontFamily: 'Poppins',
              fontSize: '13px',
              fontWeight: 500,
              padding: '10px 24px',
              borderRadius: '10px',
              borderColor: '#3EA3FF',
              color: '#3EA3FF',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#2E8FE6',
                backgroundColor: '#E3F2FD',
              },
              '&:disabled': {
                borderColor: '#ccc',
                color: '#999',
              },
            }}
          >
            {isPdfLoading ? 'Downloading...' : 'Download'}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            PaperProps={{
              sx: {
                borderRadius: '10px',
                border: '1px solid #D2D2D2',
                backgroundColor: '#FFF',
                minWidth: '120px',
                marginTop: '-8px',
              },
            }}
          >
            <MenuItem
              onClick={() => handleFormatSelect('PDF')}
              sx={{
                fontFamily: 'Poppins',
                fontSize: '12px',
                padding: '10px 20px',
                justifyContent: 'center',
                backgroundColor: selectedFormat === 'PDF' ? '#D9D9D980' : 'transparent',
                '&:hover': {
                  backgroundColor: '#D9D9D980',
                },
              }}
            >
              PDF
            </MenuItem>
            
            <MenuItem
              onClick={() => handleFormatSelect('DOCx')}
              sx={{
                fontFamily: 'Poppins',
                fontSize: '12px',
                padding: '10px 20px',
                justifyContent: 'center',
                backgroundColor: selectedFormat === 'DOCx' ? '#D9D9D980' : 'transparent',
                '&:hover': {
                  backgroundColor: '#D9D9D980',
                },
              }}
            >
              DOCx
            </MenuItem>
          </Menu>
        </Box>

        {/* Edit Button */}
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          sx={{
            fontFamily: 'Poppins',
            fontSize: '13px',
            fontWeight: 500,
            padding: '10px 24px',
            borderRadius: '10px',
            borderColor: '#3EA3FF',
            color: '#3EA3FF',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#2E8FE6',
              backgroundColor: '#E3F2FD',
            },
          }}
        >
          Edit
        </Button>

        {/* Submit for Review Button */}
        <Button
          variant="outlined"
          onClick={handleSubmitForReview}
          sx={{
            fontFamily: 'Poppins',
            fontSize: '13px',
            fontWeight: 500,
            padding: '10px 24px',
            borderRadius: '10px',
            background: 'linear-gradient(#FFF, #FFF) padding-box, linear-gradient(135deg, #3EA3FF, #FF3C80) border-box',
            border: '2px solid transparent',
            color: '#333',
            textTransform: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            '&:hover': {
              background: 'linear-gradient(#F8F8F8, #F8F8F8) padding-box, linear-gradient(135deg, #3EA3FF, #FF3C80) border-box',
            },
          }}
        >
          <span>Submit for review</span>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px', color: '#3EA3FF', fontWeight: 600 }}>
              25
            </Typography>
            <AccountBalanceWalletIcon sx={{ fontSize: '12px', color: '#3EA3FF' }} />
          </Box>
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentPreview;