"use client";

import React, { useState, useEffect } from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import UserInput from './UserInput';
import InputTaker from './InputTaker';
import FinalPreview from './FinalPreview';
import Generating from './Generating';
import DocumentPreview from './DocumentPreview';
import { useRefineMutation } from '@/redux/services/common/refineApi';
import { useUploadTextFileMutation } from '@/redux/services/common/uploadApiSlice';
import { useGetDocxFileMutation } from '@/redux/services/document/downloadApi';
import Cookies from 'js-cookie';

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedOption, setSelectedOption] = useState<'text' | 'infographic'>('text');
    const open = Boolean(anchorEl);

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
        // { id: 2, question: "Where do you want to be in three years?", answer: "", isAnswered: false },
        // { id: 3, question: "Where is your short term focus?", answer: "", isAnswered: false },
        // { id: 4, question: "Tell us about your business?", answer: "", isAnswered: false },
        // { id: 5, question: "Tell us about who you sell to? Where are they located?", answer: "", isAnswered: false },
        // { id: 6, question: "What is unique about your business?", answer: "", isAnswered: false },
        // { id: 7, question: "What marketing tools do you have available to you?", answer: "", isAnswered: false },
        // { id: 8, question: "Who do you think are your biggest competitors?", answer: "", isAnswered: false },
        // { id: 9, question: "What are your strengths, weaknesses, opps and threats?", answer: "", isAnswered: false },
        // { id: 10, question: "Tell us about your product/solution/service?", answer: "", isAnswered: false },
    ];

    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [showFinalPreview, setShowFinalPreview] = useState(false);

    const allQuestionsAnswered = questions.every(q => q.isAnswered);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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

            await uploadTextFile(payload).unwrap();
            // console.log("✅ File uploaded successfully");

            // Set WebSocket URL and show Generating component
            const websocketUrl = `wss://4iqvtvmxle.execute-api.us-east-1.amazonaws.com/prod/?session_id=${savedToken}`;
            setWsUrl(websocketUrl);
            setIsGenerating(true);
        } catch (err) {
            // console.error("❌ Upload failed", err);
        }
    };

    const handleGenerationComplete = async () => {
        // console.log("Document generation completed! Fetching document...");

        try {
            const savedToken = Cookies.get("token");
            const project_id = JSON.parse(
                localStorage.getItem("currentProject") || "{}"
            ).project_id;

            // Call the download API
            const response = await getDocxFile({
                session_id: savedToken || '',
                document_type: 'gtm',
                project_id: project_id,
            }).unwrap();

            // Set the document data
            setDocxBase64(response.docxBase64);
            setFileName(response.fileName || 'document.docx');

            // Hide generating and show document preview
            setIsGenerating(false);
            setShowDocumentPreview(true);

            // console.log("✅ Document fetched successfully");
        } catch (error) {
            // console.error("❌ Failed to fetch document:", error);
            setIsGenerating(false);
        }
    };

    // Handle generating answer from API
    const handleGenerateAnswer = async (userPrompt: string) => {
        try {
            const currentQuestion = questions[currentQuestionIndex];
            const fullPrompt = `${currentQuestion.question}\n\n${userPrompt}`;

            const response = await refine({
                prompt: fullPrompt,
                session_id: sessionId,
            }).unwrap();

            // console.log(fullPrompt);

            // Store session ID for conversation continuity
            if (response.session_id) {
                setSessionId(response.session_id);
            }

            // Set the generated answer
            setCurrentAnswer(response.groq_response);
        } catch (error) {
            // console.error('Failed to generate answer:', error);
        }
    };

    // Handle regenerate
    const handleRegenerate = async () => {
        const currentQuestion = questions[currentQuestionIndex];
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
        } else {
            // All questions answered - show final preview
            // console.log('All questions completed!');
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
                            onClick={handleClick}
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
                </>
            )}
        </Box>
    );
};

export default GTMPage;