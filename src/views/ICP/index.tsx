// ICPPage.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import DocumentQuestion from './DocumentQuestion';
import UploadDocument from './UploadDocument';
import UserInput from './UserInput';
import InputTakerUpdated from './InputTakerUpdated';
import { useGet_unanswered_questionsQuery } from '@/redux/services/common/getUnansweredQuestionsApi';

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
  const [view, setView] = useState<'initial' | 'upload' | 'questions'>('initial');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);
  const [shouldFetchQuestions, setShouldFetchQuestions] = useState(false);
  const [projectId, setProjectId] = useState<string>('');

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

  // RTK Query - only fetch when shouldFetchQuestions is true and projectId is available
  const { data, isLoading, isError } = useGet_unanswered_questionsQuery(
    {
      project_id: projectId,
      document_type: "icp"
    },
    {
      skip: !shouldFetchQuestions || !projectId
    }
  );

  // When API data is received, format it for the components
  useEffect(() => {
    if (data?.missing_questions) {
      const formattedQuestions: Question[] = data.missing_questions.map((q, index) => ({
        id: index + 1,
        question: q,
        answer: ''
      }));
      setQuestions(formattedQuestions);
      setView('questions');
      setShouldFetchQuestions(false);
    }
  }, [data]);

  const handleYesClick = () => {
    setView('upload');
  };

  const handleNoClick = () => {
    setShouldFetchQuestions(true);
  };

  const handleUpload = (file: File) => {
    console.log('File uploaded:', file.name);
  };

  const handleGenerate = (generatedAnswer: string) => {
    // Update the answer for the current question
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
      
      // Move to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        console.log('All questions answered!');
        // Handle completion logic
      }
    }
  };

  const handleItemClick = (id: number) => {
    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
    }
  };

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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {view === 'initial' && (
        <DocumentQuestion 
          onYesClick={handleYesClick} 
          onNoClick={handleNoClick}
          isLoading={isLoading}
        />
      )}

      {view === 'upload' && (
        <UploadDocument 
          onUpload={handleUpload}
          projectId={projectId}
          documentType="icp"
        />
      )}

      {view === 'questions' && questions.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          gap: '24px', 
          width: '100%', 
          maxWidth: '1200px',
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
      )}
    </Box>
  );
};

export default ICPPage;