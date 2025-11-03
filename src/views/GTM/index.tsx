"use client";

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UserInput from './UserInput';
import InputTaker from './InputTaker';
import FinalPreview from './FinalPreview';
import Generating from './Generating';
import DocumentPreview from './DocumentPreview';
import { useRefineMutation } from '@/redux/services/common/refineApi';
import { useUploadTextFileMutation } from '@/redux/services/common/uploadApiSlice';
import { useGetDocxFileMutation } from '@/redux/services/document/downloadApi';
import Cookies from 'js-cookie';
import toast, { Toaster } from "react-hot-toast";

interface Question {
    id: number;
    question: string;
    answer: string;
    isAnswered: boolean;
}

interface InputItem {
    id: number;
    question: string;
    answer: string;
}

const GTMPage: React.FC = () => {
    // Redux mutation hooks
    const [refine, { isLoading }] = useRefineMutation();
    const [uploadTextFile, { isLoading: isUploading }] = useUploadTextFileMutation();
    const [getDocxFile, { isLoading: isDownloading }] = useGetDocxFileMutation();

    // Session ID for conversation continuity
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);

    // Document generation states
    const [isGenerating, setIsGenerating] = useState(false);
    const [wsUrl, setWsUrl] = useState<string>('');

    // Document preview states
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);
    const [docxBase64, setDocxBase64] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');

    // All questions
    const initialQuestions: Question[] = [
        { id: 1, question: "What do you want to accomplish in one year?", answer: "", isAnswered: false },
        { id: 2, question: "Where do you want to be in three years?", answer: "", isAnswered: false },
        { id: 3, question: "Where is your short term focus?", answer: "", isAnswered: false },
        { id: 4, question: "Tell us about your business?", answer: "", isAnswered: false },
        { id: 5, question: "Tell us about who you sell to? Where are they located?", answer: "", isAnswered: false },
        { id: 6, question: "What is unique about your business?", answer: "", isAnswered: false },
        { id: 7, question: "What marketing tools do you have available to you?", answer: "", isAnswered: false },
        { id: 8, question: "Who do you think are your biggest competitors?", answer: "", isAnswered: false },
        { id: 9, question: "What are your strengths, weaknesses, opps and threats?", answer: "", isAnswered: false },
        { id: 10, question: "Tell us about your product/solution/service?", answer: "", isAnswered: false },
    ];

    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [showFinalPreview, setShowFinalPreview] = useState(false);

    const allQuestionsAnswered = questions.every(q => q.isAnswered);

    // Handle document generation
    const handleGenerateDocument = async () => {
        try {
            const dynamicFileName = "businessidea.txt";
            const savedToken = Cookies.get("token");
            const project_id = JSON.parse(
                localStorage.getItem("currentProject") || "{}"
            ).project_id;

            // Prepare text content from all Q&A
            const textContent = questions
                .map((q) => `Q: ${q.question}\nA: ${q.answer}`)
                .join("\n\n");

            const base64Content = btoa(unescape(encodeURIComponent(textContent)));

            const payload = {
                fileName: dynamicFileName,
                fileContent: base64Content,
                token: savedToken,
                project_id: project_id,
                document_type: "gtm",
            };

            const uploadPromise = uploadTextFile(payload).unwrap();
            
            await toast.promise(
                uploadPromise,
                {
                    loading: 'Uploading your answers...',
                    success: 'Answers uploaded successfully! Starting document generation...',
                    error: 'Failed to upload answers. Please try again.',
                }
            );

            // Set WebSocket URL and show Generating component
            const websocketUrl = `wss://4iqvtvmxle.execute-api.us-east-1.amazonaws.com/prod/?session_id=${savedToken}`;
            setWsUrl(websocketUrl);
            setIsGenerating(true);
        } catch (err) {
            // Error already handled by toast.promise
        }
    };

    const handleGenerationComplete = async () => {
        try {
            const savedToken = Cookies.get("token");
            const project_id = JSON.parse(
                localStorage.getItem("currentProject") || "{}"
            ).project_id;

            // Call the download API
            const downloadPromise = getDocxFile({
                session_id: savedToken || '',
                document_type: 'gtm',
                project_id: project_id,
            }).unwrap();

            const response = await toast.promise(
                downloadPromise,
                {
                    loading: 'Fetching your document...',
                    success: 'Document ready for preview!',
                    error: 'Failed to fetch document. Please try again.',
                }
            );

            // Set the document data
            setDocxBase64(response.docxBase64);
            setFileName(response.fileName || 'document.docx');

            // Hide generating and show document preview
            setIsGenerating(false);
            setShowDocumentPreview(true);

        } catch (error) {
            setIsGenerating(false);
            // Error already handled by toast.promise
        }
    };

    // Handle generating answer from API
    const handleGenerateAnswer = async (userPrompt: string) => {
        try {
            const currentQuestion = questions[currentQuestionIndex];
            const fullPrompt = `${currentQuestion.question}\n\n${userPrompt}`;

            const responsePromise = refine({
                prompt: fullPrompt,
                session_id: sessionId,
            }).unwrap();

            const response = await toast.promise(
                responsePromise,
                {
                    loading: 'Generating answer...',
                    success: 'Answer generated successfully!',
                    error: 'Failed to generate answer. Please try again.',
                }
            );

            // Store session ID for conversation continuity
            if (response.session_id) {
                setSessionId(response.session_id);
            }

            // Set the generated answer
            setCurrentAnswer(response.groq_response);
        } catch (error) {
            // Error already handled by toast.promise
        }
    };

    // Handle regenerate
    const handleRegenerate = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        toast('Regenerating answer...', {
            icon: '🔄',
        });
        await handleGenerateAnswer(currentQuestion.question);
    };

    // Handle confirm - move to next question
    const handleConfirm = () => {
        // Update the current question with the answer
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
            ...updatedQuestions[currentQuestionIndex],
            answer: currentAnswer,
            isAnswered: true,
        };
        setQuestions(updatedQuestions);

        // Move to next question
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentAnswer("");
            toast.success(`Answer saved! Moving to question ${currentQuestionIndex + 2}`);
        } else {
            // All questions answered - show final preview
            toast.success('All questions completed! Review your answers below.');
            setShowFinalPreview(true);
        }
    };

    // Handle manual answer edit
    const handleAnswerEdit = (newAnswer: string) => {
        setCurrentAnswer(newAnswer);
    };

    // Handle answer update in FinalPreview
    const handleFinalPreviewUpdate = (id: number, newAnswer: string) => {
        const updatedQuestions = [...questions];
        const questionIndex = updatedQuestions.findIndex(q => q.id === id);
        if (questionIndex !== -1) {
            updatedQuestions[questionIndex].answer = newAnswer;
            setQuestions(updatedQuestions);
            toast.success('Answer updated successfully!');
        }
    };

    // Convert questions to InputItem format for InputTaker
    const inputItems: InputItem[] = questions.map(q => ({
        id: q.id,
        question: q.question,
        answer: q.isAnswered ? q.answer : "Not answered yet",
    }));

    const currentQuestion = questions[currentQuestionIndex];

    // Show document preview if ready
    if (showDocumentPreview && docxBase64) {
        return <DocumentPreview docxBase64={docxBase64} fileName={fileName} />;
    }

    return (
        <Box
            sx={{
                height: '100vh',
                maxHeight: '100vh',
                backgroundColor: '#EFF1F5',
                padding: '20px',
                display: 'flex',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {isGenerating ? (
                // Show Generating component when document is being generated
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Generating wsUrl={wsUrl} onComplete={handleGenerationComplete} />
                </Box>
            ) : (
                <>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                        {showFinalPreview ? (
                            <FinalPreview
                                questionsAnswers={questions.map(q => ({
                                    id: q.id,
                                    question: q.question,
                                    answer: q.answer
                                }))}
                                onAnswerUpdate={handleFinalPreviewUpdate}
                            />
                        ) : (
                            <UserInput
                                number={currentQuestion.id}
                                question={currentQuestion.question}
                                answer={currentAnswer}
                                isLoading={isLoading}
                                onGenerate={handleGenerateAnswer}
                                onRegenerate={handleRegenerate}
                                onConfirm={handleConfirm}
                            />
                        )}
                    </Box>

                    <Box sx={{ width: '350px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <InputTaker
                            items={inputItems}
                            currentQuestionId={currentQuestion.id}
                            answeredIds={questions.filter(q => q.isAnswered).map(q => q.id)}
                            isClickable={false}
                        />
                    </Box>

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
                            onClick={handleGenerateDocument}
                            disabled={!allQuestionsAnswered || isUploading}
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
                    </Box>
                </>
            )}

            <Toaster position="top-right" reverseOrder={false} />
        </Box>
    );
};

export default GTMPage;