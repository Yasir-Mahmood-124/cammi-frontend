import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, CircularProgress, Menu, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SaveIcon from '@mui/icons-material/Save';
import { useDownloadPdfMutation } from '@/redux/services/document/download-pdf';
import { useSendReviewDocumentMutation } from '@/redux/services/common/send_review';
import { useGetDocxFileMutation } from '@/redux/services/document/downloadApi';
import { useDispatch } from 'react-redux';
import { resetForNewDocument as resetIcp } from '@/redux/services/icp/icpSlice';
import { resetForNewDocument as resetKmf } from '@/redux/services/kmf/kmfSlice';
import { resetForNewDocument as resetBs } from '@/redux/services/bs/bsSlice';
import { resetForNewDocument as resetSr } from '@/redux/services/sr/srSlice';
import { resetForNewDocument as resetGtm } from '@/redux/services/gtm/gtmSlice';
import { AppDispatch } from '@/redux/store';
import Cookies from 'js-cookie';
import EditHeadingDialog from './EditHeadingDialog';
import toast from 'react-hot-toast';

interface DocumentPreviewProps {
  docxBase64: string;
  fileName: string;
  documentType: 'icp' | 'kmf' | 'bs' | 'sr' | 'gtm';
}

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ docxBase64, fileName, documentType }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [currentDocxBase64, setCurrentDocxBase64] = useState<string>(docxBase64);
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [documentHtml, setDocumentHtml] = useState<string>('');
  const [documentText, setDocumentText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'DOCx' | null>(null);
  const open = Boolean(anchorEl);
  const contentRef = useRef<HTMLDivElement>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [downloadPdf, { isLoading: isPdfLoading }] = useDownloadPdfMutation();
  const [sendReview, { isLoading: isReviewLoading }] = useSendReviewDocumentMutation();
  const [getDocxFile, { isLoading: isDownloading }] = useGetDocxFileMutation();

  // Document type labels
  const documentTypeLabels = {
    icp: 'ICP',
    kmf: 'KMF',
    bs: 'BS',
    sr: 'SR',
    gtm: 'GTM'
  };

  useEffect(() => {
    setCurrentDocxBase64(docxBase64);
  }, [docxBase64]);

  useEffect(() => {
    const parseDocx = async () => {
      try {
        const mammoth = await import('mammoth');
        
        const binaryString = atob(currentDocxBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
        const textResult = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
        setDocumentText(textResult.value);
        
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
        setIsLoading(false);
      }
    };

    parseDocx();
  }, [currentDocxBase64]);

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
      await handleDownloadDocx();
    } else if (format === 'PDF') {
      await handleDownloadPdf();
    }
  };

  const handleDownloadDocx = async () => {
    try {
      toast.loading('Preparing document...', { id: 'docx-download' });

      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      console.log('🔄 Fetching latest DOCX from server...');

      const response = await getDocxFile({
        session_id: savedToken || "",
        document_type: documentType,
        project_id: project_id,
      }).unwrap();

      console.log('✅ Latest DOCX received from server');

      setCurrentDocxBase64(response.docxBase64);

      const binaryString = atob(response.docxBase64);
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

      toast.success('Document downloaded!', { id: 'docx-download' });
      console.log('✅ DOCX downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download DOCX:', error);
      toast.error('Failed to download document', { id: 'docx-download' });
    }
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
        document_type: documentType,
      }).unwrap();

      const byteCharacters = atob(response.base64_pdf);
      const byteArrays = [];
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }

      const blob = new Blob([new Uint8Array(byteArrays)], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Failed to download PDF:', error);
    }
  };

  const handleEdit = () => {
    setOpenEditDialog(true);
  };

  const handleSubmitForReview = async () => {
    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      const response = await sendReview({
        session_id: savedToken || '',
        project_id: project_id,
        document_type: documentType,
        document_text: documentText,
      }).unwrap();

      toast.success('Document submitted for review successfully!');
    } catch (error) {
      console.error('❌ Failed to submit for review:', error);
      toast.error('Failed to submit document for review');
    }
  };

  const handleSave = () => {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log(`║           💾 Saving ${documentTypeLabels[documentType]} Document & Resetting State         ║`);
    console.log("╚════════════════════════════════════════════════════════════╝");
    
    toast.success("Document saved successfully!");
    
    if (documentType === 'icp') {
      dispatch(resetIcp());
    } else if (documentType === 'kmf') {
      dispatch(resetKmf());
    } else if (documentType === 'bs') {
      dispatch(resetBs());
    } else if (documentType === 'sr') {
      dispatch(resetSr());
    } else if (documentType === 'gtm') {
      dispatch(resetGtm());
    }
    
    console.log("✅ Redux state reset - returning to initial view");
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

  const fetchLatestDocument = async () => {
    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      console.log('🔄 Fetching latest document after edit...');

      const response = await getDocxFile({
        session_id: savedToken || "",
        document_type: documentType,
        project_id: project_id,
      }).unwrap();

      console.log('✅ Latest document received');

      setCurrentDocxBase64(response.docxBase64);

      setIsLoading(true);
      setDocumentHtml("");
      setTableOfContents([]);
      setDocumentText("");

      const binaryString = atob(response.docxBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const mammoth = await import("mammoth");

      const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
      const textResult = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });

      setDocumentText(textResult.value);

      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, "text/html");
      const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

      const toc: TableOfContentsItem[] = [];
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent || "";
        const id = `heading-${index}`;
        heading.id = id;
        toc.push({ id, text, level });
      });

      setDocumentHtml(doc.body.innerHTML);
      setTableOfContents(toc);
      if (toc.length > 0) setActiveSection(toc[0].id);

      console.log("✅ Document refreshed successfully");
    } catch (error) {
      console.error("❌ Failed to refresh document:", error);
    } finally {
      setIsLoading(false);
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
          Your Document is Generated
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
          
          <Box 
            id="toc-container"
            sx={{ 
              flex: 1,
              overflowY: 'auto',
              direction: 'rtl',
              paddingLeft: '12px',
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
            <Box sx={{ direction: 'ltr' }}>
              {tableOfContents.map((item) => (
                <Box
                  key={item.id}
                  id={`toc-${item.id}`}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    padding: '10px 12px',
                    paddingLeft: `${12 + (item.level - 1) * 16}px`,
                    marginBottom: '4px',
                    marginLeft: '8px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s ease',
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
                    transition: 'color 0.2s ease',
                  }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
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
            paddingRight: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflowY: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#D9D9D9',
              borderRadius: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid #D9D9D9',
              '&:hover': {
                backgroundColor: '#F5F5F5',
              },
            },
          }}>
          <Box 
            sx={{
              fontFamily: 'Poppins',
              paddingRight: '20px',
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
        {/* Download Button with Dropdown */}
        <Box sx={{ position: 'relative', display: 'flex' }}>
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
            disabled={isPdfLoading || isDownloading}
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
            {isPdfLoading || isDownloading ? 'Downloading...' : 'Download'}
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
          }}
        >
          Edit
        </Button>

        <EditHeadingDialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            fetchLatestDocument();
          }}
          documentType={documentType}
        />

        {/* Submit for Review Button */}
        <Button
          variant="outlined"
          onClick={handleSubmitForReview}
          disabled={isReviewLoading}
          sx={{
            fontFamily: 'Poppins',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 20px',
            borderRadius: '6px',
            background: 'linear-gradient(#FFF, #FFF) padding-box, linear-gradient(135deg, #3EA3FF, #FF3C80) border-box',
            border: '2px solid transparent',
            color: '#333',
            textTransform: 'none',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
            '&:hover': {
              background: 'linear-gradient(#F8F8F8, #F8F8F8) padding-box, linear-gradient(135deg, #3EA3FF, #FF3C80) border-box',
            },
            '&:disabled': {
              opacity: 0.6,
            },
          }}
        >
          <span>{isReviewLoading ? 'Submitting...' : 'Submit for review'}</span>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px', color: '#3EA3FF', fontWeight: 600 }}>
              25
            </Typography>
            <AccountBalanceWalletIcon sx={{ fontSize: '12px', color: '#3EA3FF' }} />
          </Box>
        </Button>

        {/* Save Button */}
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            fontFamily: 'Poppins',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 20px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #3EA3FF, #FF3C80)',
            color: '#FFF',
            textTransform: 'none',
            boxShadow: '0 3px 8px rgba(62, 163, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2E8FE6, #E6356D)',
              boxShadow: '0 4px 12px rgba(62, 163, 255, 0.4)',
            },
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentPreview;