// ICPPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DocumentQuestion from './DocumentQuestion';
import UploadDocument from './UploadDocument';
import UserInput from './UserInput';
import InputTakerUpdated from './InputTakerUpdated';
import FinalPreview from './FinalPreview';
import Generating from './Generating';
import DocumentPreview from './DocumentPreview';
import { useGet_unanswered_questionsQuery } from '@/redux/services/common/getUnansweredQuestionsApi';
import { useGetQuestionsQuery } from '@/redux/services/common/getQuestionsApi';
import { useUploadTextFileMutation } from '@/redux/services/common/uploadApiSlice';
import { useGetDocxFileMutation } from '@/redux/services/document/downloadApi';
import Cookies from 'js-cookie';

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface CurrentProject {
  organization_id: string;
  organization_name: string;
  project_id: string;
  project_name: string;
}

const ICPPage: React.FC = () => {
  const [view, setView] = useState<'initial' | 'upload' | 'questions' | 'preview'>('initial');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);
  const [shouldFetchUnanswered, setShouldFetchUnanswered] = useState(false);
  const [shouldFetchAll, setShouldFetchAll] = useState(false);
  const [projectId, setProjectId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOption, setSelectedOption] = useState<'text' | 'infographic'>('text');

  // Document generation states - MATCHING GTMPage pattern
  const [isGenerating, setIsGenerating] = useState(false);
  const [wsUrl, setWsUrl] = useState<string>('');
  
  // Document preview states
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [docxBase64, setDocxBase64] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const open = Boolean(anchorEl);

  // Redux mutation hooks
  const [uploadTextFile, { isLoading: isUploading }] = useUploadTextFileMutation();
  const [getDocxFile, { isLoading: isDownloading }] = useGetDocxFileMutation();

  // Get project_id from localStorage on component mount
  useEffect(() => {
    const currentProjectStr = localStorage.getItem('currentProject');
    if (currentProjectStr) {
      try {
        const currentProject: CurrentProject = JSON.parse(currentProjectStr);
        setProjectId(currentProject.project_id);
      } catch (error) {
        console.error('Error parsing currentProject from localStorage:', error);
      }
    }
  }, []);

  // RTK Query for unanswered questions
  const { 
    data: unansweredData, 
    isLoading: isLoadingUnanswered, 
    isError: isErrorUnanswered 
  } = useGet_unanswered_questionsQuery(
    {
      project_id: projectId,
      document_type: "icp"
    },
    {
      skip: !shouldFetchUnanswered || !projectId
    }
  );

  // RTK Query for all questions (answered)
  const { 
    data: allQuestionsData, 
    isLoading: isLoadingAll, 
    isError: isErrorAll 
  } = useGetQuestionsQuery(
    {
      project_id: projectId,
      document_type: "icp"
    },
    {
      skip: !shouldFetchAll || !projectId
    }
  );

  // Handle unanswered questions response
  useEffect(() => {
    if (unansweredData) {
      if (unansweredData.missing_questions && unansweredData.missing_questions.length > 0) {
        const formattedQuestions: Question[] = unansweredData.missing_questions.map((q, index) => ({
          id: index + 1,
          question: q,
          answer: ''
        }));
        setQuestions(formattedQuestions);
        setView('questions');
        setShouldFetchUnanswered(false);
      } else {
        console.log('No unanswered questions found, fetching all answered questions...');
        setShouldFetchUnanswered(false);
        setShouldFetchAll(true);
      }
    }
  }, [unansweredData]);

  // Handle all questions (answered) response
  useEffect(() => {
    if (allQuestionsData && allQuestionsData.questions) {
      const formattedQuestions: Question[] = allQuestionsData.questions.map((q, index) => ({
        id: index + 1,
        question: q.question_text,
        answer: q.answer_text || ''
      }));
      setQuestions(formattedQuestions);
      setView('preview');
      setShouldFetchAll(false);
    }
  }, [allQuestionsData]);

  // Check if all questions are answered
  const allQuestionsAnswered = questions.length > 0 && questions.every(q => q.answer.trim() !== '');

  const handleYesClick = () => {
    setView('upload');
  };

  const handleNoClick = () => {
    setShouldFetchUnanswered(true);
  };

  const handleUpload = (file: File) => {
    console.log('File uploaded:', file.name);
  };

  const handleGenerate = (generatedAnswer: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].answer = generatedAnswer;
    setQuestions(updatedQuestions);
  };

  const handleRegenerate = () => {
    console.log('Regenerate answer');
  };

  const handleConfirm = () => {
    if (questions[currentQuestionIndex].answer) {
      setAnsweredIds([...answeredIds, questions[currentQuestionIndex].id]);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        console.log('All questions answered!');
        setView('preview');
      }
    }
  };

  const handleItemClick = (id: number) => {
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleViewPreview = () => {
    setView('preview');
  };

  const handleBackToQuestions = () => {
    setView('questions');
  };

  const handleAnswerUpdate = (id: number, newAnswer: string) => {
    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, answer: newAnswer } : q
    );
    setQuestions(updatedQuestions);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = async (option: 'text' | 'infographic') => {
    setSelectedOption(option);
    handleClose();

    if (option === 'text') {
      await handleGenerateDocument();
    }
  };

  // Handle document generation - MATCHING GTMPage pattern exactly
  const handleGenerateDocument = async () => {
    try {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚀 STARTING DOCUMENT GENERATION FOR ICP');
      console.log('═══════════════════════════════════════════════════════');
      
      const dynamicFileName = "businessidea.txt";
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      console.log('📋 Configuration:');
      console.log('   - File Name:', dynamicFileName);
      console.log('   - Token:', savedToken ? `${savedToken.substring(0, 20)}...` : 'MISSING!');
      console.log('   - Project ID:', project_id);
      console.log('   - Document Type: icp');
      console.log('───────────────────────────────────────────────────────');

      // Prepare text content from all Q&A
      const textContent = questions
        .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
        .join("\n\n");

      console.log('📄 Text Content:');
      console.log('   - Total Length:', textContent.length, 'characters');
      console.log('   - Number of Questions:', questions.length);
      console.log('   - Preview (first 200 chars):');
      console.log('   ', textContent.substring(0, 200) + '...');
      console.log('───────────────────────────────────────────────────────');

      const base64Content = btoa(unescape(encodeURIComponent(textContent)));
      console.log('📦 Base64 Encoded:');
      console.log('   - Base64 Length:', base64Content.length, 'characters');
      console.log('───────────────────────────────────────────────────────');

      const payload = {
        fileName: dynamicFileName,
        fileContent: base64Content,
        token: savedToken,
        project_id: project_id,
        document_type: "icp",
      };

      console.log('📤 UPLOADING FILE TO SERVER...');
      console.log('   - Payload Keys:', Object.keys(payload));
      console.log('   - Calling uploadTextFile mutation...');

      const uploadResponse = await uploadTextFile(payload).unwrap();
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ FILE UPLOADED SUCCESSFULLY!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📥 Upload Response:', uploadResponse);
      console.log('───────────────────────────────────────────────────────');

      // Set WebSocket URL and show Generating component - EXACTLY like GTMPage
      const websocketUrl = `wss://4iqvtvmxle.execute-api.us-east-1.amazonaws.com/prod/?session_id=${savedToken}`;
      
      console.log('🔌 WEBSOCKET CONFIGURATION:');
      console.log('   - WebSocket URL:', websocketUrl);
      console.log('   - Session ID:', savedToken);
      console.log('───────────────────────────────────────────────────────');
      
      console.log('⚙️  SETTING STATE:');
      console.log('   - Setting wsUrl state...');
      setWsUrl(websocketUrl);
      console.log('   - wsUrl state set to:', websocketUrl);
      
      console.log('   - Setting isGenerating to true...');
      setIsGenerating(true);
      console.log('   - isGenerating state set to: true');
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('✨ SWITCHED TO GENERATING VIEW');
      console.log('   - Component should now render <Generating />');
      console.log('   - WebSocket should connect automatically');
      console.log('═══════════════════════════════════════════════════════');
      
    } catch (err: any) {
      console.log('═══════════════════════════════════════════════════════');
      console.error("❌ UPLOAD FAILED!");
      console.log('═══════════════════════════════════════════════════════');
      console.error('Error Object:', err);
      console.error('Error Name:', err?.name);
      console.error('Error Message:', err?.message);
      console.error('Error Status:', err?.status);
      console.error('Error Data:', err?.data);
      console.error('Full Error:', JSON.stringify(err, null, 2));
      console.log('═══════════════════════════════════════════════════════');
      alert('Upload failed. Please try again.');
    }
  };

  const handleGenerationComplete = async () => {
    console.log("🎉 Document generation completed! Fetching document...");
    
    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      console.log('📥 Downloading document...');

      // Call the download API
      const response = await getDocxFile({
        session_id: savedToken || '',
        document_type: 'icp',
        project_id: project_id,
      }).unwrap();

      console.log('📄 Document received');

      // Set the document data
      setDocxBase64(response.docxBase64);
      setFileName(response.fileName || 'icp_document.docx');
      
      // Hide generating and show document preview - EXACTLY like GTMPage
      setIsGenerating(false);
      setShowDocumentPreview(true);
      
      console.log("✅ Document fetched successfully");
    } catch (error) {
      console.error("❌ Failed to fetch document:", error);
      setIsGenerating(false);
      alert('Failed to download document. Please try again.');
    }
  };

  // Combined loading state
  const isLoading = isLoadingUnanswered || isLoadingAll;
  const isError = isErrorUnanswered || isErrorAll;

  // Show button when in questions or preview view
  const showButton = view === 'questions' || view === 'preview';

  if (isError) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ color: 'red', fontFamily: 'Poppins' }}>
          Error loading questions. Please try again.
        </div>
      </Box>
    );
  }

  // Show document preview if ready - EXACTLY like GTMPage
  if (showDocumentPreview && docxBase64) {
    return <DocumentPreview docxBase64={docxBase64} fileName={fileName} />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#EFF1F5',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {isGenerating ? (
        // Show Generating component when document is being generated - EXACTLY like GTMPage
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Generating wsUrl={wsUrl} onComplete={handleGenerationComplete} />
        </Box>
      ) : (
        <>
          {/* INITIAL VIEW */}
          {view === 'initial' && (
            <DocumentQuestion 
              onYesClick={handleYesClick} 
              onNoClick={handleNoClick}
              isLoading={isLoading}
            />
          )}

          {/* UPLOAD VIEW */}
          {view === 'upload' && (
            <UploadDocument 
              onUpload={handleUpload}
              projectId={projectId}
              documentType="icp"
            />
          )}

          {/* QUESTIONS VIEW */}
          {view === 'questions' && questions.length > 0 && (
            <Box sx={{ width: '100%', maxWidth: '1200px' }}>
              <Box sx={{ 
                display: 'flex', 
                gap: '24px', 
                width: '100%',
                alignItems: 'flex-start',
                height: '100%',
                maxHeight: '500px',
              }}>
                
                {/* Left Side - Current Question Input */}
                <Box sx={{ flex: 1, height: '200vh' }}>
                  <UserInput
                    number={questions[currentQuestionIndex].id}
                    question={questions[currentQuestionIndex].question}
                    answer={questions[currentQuestionIndex].answer}
                    documentType="icp"
                    isLoading={false}
                    onGenerate={handleGenerate}
                    onRegenerate={handleRegenerate}
                    onConfirm={handleConfirm}
                  />
                </Box>

                {/* Right Side - Question List */}
                <Box sx={{ flex: '0 0 300px', height: '100%' }}>
                  <InputTakerUpdated
                    items={questions}
                    currentQuestionId={questions[currentQuestionIndex].id}
                    answeredIds={answeredIds}
                    onItemClick={handleItemClick}
                    isClickable={true}
                  />
                </Box>
              </Box>

              {/* Preview Button */}
              {allQuestionsAnswered && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginTop: '24px' 
                }}>
                  <Button
                    onClick={handleViewPreview}
                    sx={{
                      background: 'linear-gradient(135deg, #3EA3FF, #FF3C80)',
                      color: '#fff',
                      textTransform: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontWeight: 600,
                      padding: '10px 32px',
                      borderRadius: '8px',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #3595E8, #E63573)',
                      },
                    }}
                  >
                    View Final Preview
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* PREVIEW VIEW */}
          {view === 'preview' && (
            <Box sx={{ 
              width: '100%', 
              maxWidth: '1200px',
              display: 'flex',
              justifyContent: 'flex-start',
              paddingLeft: '20px',
            }}>
              <Box sx={{ width: '100%', maxWidth: '900px' }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start', 
                  alignItems: 'center',
                  marginBottom: '16px' 
                }}>
                  {questions.some(q => q.answer === '') && (
                    <Button
                      onClick={handleBackToQuestions}
                      sx={{
                        color: '#3EA3FF',
                        textTransform: 'none',
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(62, 163, 255, 0.1)',
                        },
                      }}
                    >
                      ← Back to Questions
                    </Button>
                  )}
                </Box>

                <FinalPreview 
                  questionsAnswers={questions}
                  onAnswerUpdate={handleAnswerUpdate}
                />
              </Box>
            </Box>
          )}

          {/* Generate Document Button */}
          {showButton && (
            <Box
              sx={{
                position: 'fixed',
                bottom: '19px',
                right: '118px',
              }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon sx={{ fontSize: '14px' }} />}
                onClick={handleClick}
                disabled={view !== 'preview' || !allQuestionsAnswered || isUploading}
                sx={{
                  background: 'linear-gradient(135deg, #3EA3FF, #FF3C80)',
                  color: '#fff',
                  textTransform: 'none',
                  fontFamily: 'Poppins',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  boxShadow: '0 3px 8px rgba(62, 163, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2E8FE6, #E6356D)',
                    boxShadow: '0 4px 11px rgba(62, 163, 255, 0.4)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                    color: '#666',
                  },
                }}
              >
                {isUploading ? 'Uploading...' : 'Generate Document'}
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
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
                    minWidth: '180px',
                    marginTop: '-8px',
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleOptionSelect('text')}
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '11px',
                    padding: '10px 14px',
                    backgroundColor: selectedOption === 'text' ? '#D9D9D980' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#D9D9D980',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px' }}>
                      Text Base
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px', color: '#3EA3FF' }}>
                        25
                      </Typography>
                      <AccountBalanceWalletIcon sx={{ fontSize: '13px', color: '#3EA3FF' }} />
                    </Box>
                  </Box>
                </MenuItem>
                
                <MenuItem
                  onClick={() => handleOptionSelect('infographic')}
                  sx={{
                    fontFamily: 'Poppins',
                    fontSize: '11px',
                    padding: '10px 14px',
                    backgroundColor: selectedOption === 'infographic' ? '#D9D9D980' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#D9D9D980',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px' }}>
                      Infographic Base
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px', color: '#3EA3FF' }}>
                        50
                      </Typography>
                      <AccountBalanceWalletIcon sx={{ fontSize: '13px', color: '#3EA3FF' }} />
                    </Box>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ICPPage;