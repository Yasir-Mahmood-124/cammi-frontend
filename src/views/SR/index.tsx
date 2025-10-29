// SRPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DocumentQuestion from '../ICP/DocumentQuestion';
import UploadDocument from '../ICP/UploadDocument';
import UserInput from '../ICP/UserInput';
import InputTakerUpdated from '../ICP/InputTakerUpdated';
import FinalPreview from '../ICP/FinalPreview';
import Generating from '../ICP/Generating';
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

const SRPage: React.FC = () => {
  const [view, setView] = useState<'initial' | 'upload' | 'questions' | 'preview'>('initial');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);
  const [shouldFetchUnanswered, setShouldFetchUnanswered] = useState(false);
  const [shouldFetchAll, setShouldFetchAll] = useState(false);
  const [projectId, setProjectId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOption, setSelectedOption] = useState<'text' | 'infographic'>('text');

  // Document generation states
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
        // console.error('Error parsing currentProject from localStorage:', error);
      }
    }
  }, []);

  // Setup WebSocket URL for upload - USING THE CORRECT DEV ENDPOINT
  useEffect(() => {
    // Use the WebSocket URL from your working project
    const websocketUrl = "wss://91vm5ilj37.execute-api.us-east-1.amazonaws.com/dev";
    setWsUrl(websocketUrl);
    // console.log('🔌 WebSocket URL set for upload:', websocketUrl);
  }, []);

  // RTK Query for unanswered questions
  const { 
    data: unansweredData, 
    isLoading: isLoadingUnanswered, 
    isError: isErrorUnanswered 
  } = useGet_unanswered_questionsQuery(
    {
      project_id: projectId,
      document_type: "sr"
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
      document_type: "sr"
    },
    {
      skip: !shouldFetchAll || !projectId
    }
  );

  // Handle unanswered questions response (NO flow)
  useEffect(() => {
    if (unansweredData) {
      // console.log('📋 Unanswered questions data received:', unansweredData);
      
      if (unansweredData.missing_questions && unansweredData.missing_questions.length > 0) {
        // console.log('❓ Has unanswered questions:', unansweredData.missing_questions.length);
        
        const formattedQuestions: Question[] = unansweredData.missing_questions.map((q, index) => ({
          id: index + 1,
          question: q,
          answer: ''
        }));
        setQuestions(formattedQuestions);
        setView('questions');
        setShouldFetchUnanswered(false);
      } else {
        // console.log('✅ No unanswered questions - fetching all answered questions');
        setShouldFetchUnanswered(false);
        setShouldFetchAll(true);
      }
    }
  }, [unansweredData]);

  // Handle all questions (answered) response
  useEffect(() => {
    if (allQuestionsData && allQuestionsData.questions) {
      // console.log('📝 All questions data received:', allQuestionsData.questions.length, 'questions');
      
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

  // Handle WebSocket upload response - MATCHING YOUR WORKING PROJECT
  const handleUploadComplete = (data: any) => {
    // Handle processing_started
    if (data.status === "processing_started") {
      // console.log('🚀 Processing started:', data.message);
      return;
    }

    // Handle analyzing_document
    if (data.status === "analyzing_document") {
      // console.log('🔍 Analyzing document:', data.message);
      return;
    }

    // Handle questions_need_answers - MAIN CASE
    if (data.status === 'questions_need_answers' && data.not_found_questions) {
      // console.log('❓ Questions need answers - Count:', data.not_found_questions.length);
      // console.log('Questions array:', data.not_found_questions);
      
      // Extract questions from the objects
      const formattedQuestions: Question[] = data.not_found_questions.map((item: any, index: number) => {
        // The question might be in item.question or item.question_text
        const questionText = item.question || item.question_text || item;
        // console.log(`Question ${index + 1}:`, questionText);
        
        return {
          id: index + 1,
          question: typeof questionText === 'string' ? questionText : String(questionText),
          answer: ''
        };
      });
      setQuestions(formattedQuestions);
      setView('questions');
      
      // console.log('✅ Switched to questions view');
      return;
    }

    // Handle processing_complete
    if (data.status === "processing_complete") {
      // console.log('✅ Processing complete!');
      
      // Check if there are any results with "Not Found" 
      if (data.results) {
        const notFoundQuestions = Object.entries(data.results)
          .filter(([_, answer]) => answer === "Not Found")
          .map(([question, _], index) => ({
            id: index + 1,
            question: question,
            answer: ''
          }));

        if (notFoundQuestions.length > 0) {
          // console.log('❓ Found "Not Found" questions:', notFoundQuestions.length);
          setQuestions(notFoundQuestions);
          setView('questions');
        } else {
          // console.log('✅ No missing questions - Going to preview');
          setShouldFetchAll(true);
        }
      } else {
        // No results, go to preview
        // console.log('✅ No results field - Going to preview');
        setShouldFetchAll(true);
      }
      return;
    }

    // Handle errors
    if (data.message === "Forbidden" || data.status === "error") {
      // console.error('❌ WebSocket Error:', data.message || data.status);
      return;
    }
  };

  const handleGenerate = (generatedAnswer: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].answer = generatedAnswer;
    setQuestions(updatedQuestions);
  };

  const handleRegenerate = () => {
    // console.log('Regenerate answer');
  };

  const handleConfirm = () => {
    if (questions[currentQuestionIndex].answer) {
      setAnsweredIds([...answeredIds, questions[currentQuestionIndex].id]);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // console.log('All questions answered!');
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

  // Handle document generation from Q&A
  const handleGenerateDocument = async () => {
    try {
      const dynamicFileName = "businessidea.txt";
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      const textContent = questions
        .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
        .join("\n\n");

      const base64Content = btoa(unescape(encodeURIComponent(textContent)));

      const payload = {
        fileName: dynamicFileName,
        fileContent: base64Content,
        token: savedToken,
        project_id: project_id,
        document_type: "sr",
      };

      const uploadResponse = await uploadTextFile(payload).unwrap();
      // console.log('✅ FILE UPLOADED SUCCESSFULLY!', uploadResponse);

      const websocketUrl = `wss://4iqvtvmxle.execute-api.us-east-1.amazonaws.com/prod/?session_id=${savedToken}`;
      
      setWsUrl(websocketUrl);
      setIsGenerating(true);
      
    } catch (err: any) {
      // console.error("❌ UPLOAD FAILED!", err);
      alert('Upload failed. Please try again.');
    }
  };

  const handleGenerationComplete = async () => {
    // console.log("✅ Document generation completed! Fetching document...");
    
    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      const response = await getDocxFile({
        session_id: savedToken || '',
        document_type: 'sr',
        project_id: project_id,
      }).unwrap();

      setDocxBase64(response.docxBase64);
      setFileName(response.fileName || 'sr_document.docx');
      
      setIsGenerating(false);
      setShowDocumentPreview(true);
      
      // console.log("✅ Document fetched successfully");
    } catch (error) {
      // console.error("❌ Failed to fetch document:", error);
      setIsGenerating(false);
      alert('Failed to download document. Please try again.');
    }
  };

  const isLoading = isLoadingUnanswered || isLoadingAll;
  const isError = isErrorUnanswered || isErrorAll;
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

  if (showDocumentPreview && docxBase64) {
    return <DocumentPreview docxBase64={docxBase64} fileName={fileName} />;
  }

  return (
    <Box
      sx={{
        backgroundColor: '#EFF1F5',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {isGenerating ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Generating wsUrl={wsUrl} onComplete={handleGenerationComplete} />
        </Box>
      ) : (
        <>
          {view === 'initial' && (
            <DocumentQuestion 
              onYesClick={handleYesClick} 
              onNoClick={handleNoClick}
              isLoading={isLoading}
            />
          )}

          {view === 'upload' && (
            <UploadDocument 
              document_type="sr"
              wsUrl={wsUrl}
              onUploadComplete={handleUploadComplete}
            />
          )}

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
                <Box sx={{ flex: 1, height: '100vh' }}>
                  <UserInput
                    number={questions[currentQuestionIndex].id}
                    question={questions[currentQuestionIndex].question}
                    answer={questions[currentQuestionIndex].answer}
                    documentType="sr"
                    isLoading={false}
                    onGenerate={handleGenerate}
                    onRegenerate={handleRegenerate}
                    onConfirm={handleConfirm}
                  />
                </Box>

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
            </Box>
          )}

          {view === 'preview' && (
            <Box sx={{ 
              width: '100%', 
              maxWidth: '1200px',
              display: 'flex',
              justifyContent: 'flex-start',
              paddingLeft: '20px',
            }}>
              <Box sx={{ width: '100%', maxWidth: '900px' }}>
                {questions.some(q => q.answer === '') && (
                  <Button
                    onClick={handleBackToQuestions}
                    sx={{
                      color: '#3EA3FF',
                      textTransform: 'none',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontWeight: 500,
                      marginBottom: '16px',
                      '&:hover': {
                        backgroundColor: 'rgba(62, 163, 255, 0.1)',
                      },
                    }}
                  >
                    ← Back to Questions
                  </Button>
                )}

                <FinalPreview 
                  questionsAnswers={questions}
                  onAnswerUpdate={handleAnswerUpdate}
                />
              </Box>
            </Box>
          )}

          {showButton && (
            <Box sx={{ position: 'fixed', bottom: '25px', right: '60px' }}>
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
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
                <MenuItem onClick={() => handleOptionSelect('text')} sx={{ fontFamily: 'Poppins', fontSize: '11px', padding: '10px 14px', backgroundColor: selectedOption === 'text' ? '#D9D9D980' : 'transparent', '&:hover': { backgroundColor: '#D9D9D980' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px' }}>Text Base</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px', color: '#3EA3FF' }}>25</Typography>
                      <AccountBalanceWalletIcon sx={{ fontSize: '13px', color: '#3EA3FF' }} />
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleOptionSelect('infographic')} sx={{ fontFamily: 'Poppins', fontSize: '11px', padding: '10px 14px', backgroundColor: selectedOption === 'infographic' ? '#D9D9D980' : 'transparent', '&:hover': { backgroundColor: '#D9D9D980' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px' }}>Infographic Base</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '11px', color: '#3EA3FF' }}>50</Typography>
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

export default SRPage;