"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Cammi } from '@/assests/icons';
import { useRefineMutation } from '@/redux/services/common/refineApi';
import { useAddQuestionMutation } from '@/redux/services/common/addQuestion';

interface UserInputProps {
    number: number;
    question: string;
    answer: string;
    isLoading?: boolean;
    documentType: string;
    onGenerate?: (prompt: string) => void;
    onRegenerate?: () => void;
    onConfirm?: () => void;
}

const UserInput: React.FC<UserInputProps> = ({
    number,
    question,
    answer,
    isLoading = false,
    documentType,
    onGenerate,
    onRegenerate,
    onConfirm
}) => {
    const [inputValue, setInputValue] = useState('');
    const [displayedAnswer, setDisplayedAnswer] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const answerFieldRef = React.useRef<HTMLInputElement>(null);

    // RTK Query mutations
    const [refine, { isLoading: isRefining }] = useRefineMutation();
    const [addQuestion, { isLoading: isAddingQuestion }] = useAddQuestionMutation();

    // Typing animation effect
    useEffect(() => {
        if (!answer) {
            setDisplayedAnswer('');
            return;
        }

        setIsTyping(true);
        setDisplayedAnswer('');
        let currentIndex = 0;

        const typingInterval = setInterval(() => {
            if (currentIndex < answer.length) {
                setDisplayedAnswer(answer.substring(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(typingInterval);
            }
        }, 20);

        return () => clearInterval(typingInterval);
    }, [answer]);

    // Auto-focus and position cursor at end when typing completes
    useEffect(() => {
        if (!isTyping && displayedAnswer && answerFieldRef.current) {
            const textField = answerFieldRef.current;
            // Small delay to ensure the field is ready
            setTimeout(() => {
                textField.focus();
                // Set cursor position to the end
                const length = displayedAnswer.length;
                textField.setSelectionRange(length, length);
            }, 100);
        }
    }, [isTyping, displayedAnswer]);

    const handleSendClick = async () => {
        if (inputValue.trim()) {
            try {
                // Combine question with user input
                const fullPrompt = `${question}\n\n${inputValue.trim()}`;

                // Call refine API
                const refinePayload = {
                    prompt: fullPrompt,
                    ...(sessionId && { session_id: sessionId })
                };

                console.log(fullPrompt);

                const refineResult = await refine(refinePayload).unwrap();

                // Update session_id if returned
                if (refineResult.session_id) {
                    setSessionId(refineResult.session_id);
                }

                // Update the answer with groq_response
                if (onGenerate) {
                    onGenerate(refineResult.groq_response);
                }

                setInputValue('');
            } catch (error) {
                console.error('Error generating answer:', error);
                // You might want to show an error message to the user here
            }
        }
    };

    const handleRegenerateClick = async () => {
        if (displayedAnswer) {
            try {
                // Use the current displayed answer as the prompt for regeneration
                const refinePayload = {
                    prompt: `Regenerate and improve this answer: ${displayedAnswer}`,
                    ...(sessionId && { session_id: sessionId })
                };

                const refineResult = await refine(refinePayload).unwrap();

                // Update session_id if returned
                if (refineResult.session_id) {
                    setSessionId(refineResult.session_id);
                }

                // Update the answer with new groq_response
                if (onGenerate) {
                    onGenerate(refineResult.groq_response);
                }
            } catch (error) {
                console.error('Error regenerating answer:', error);
            }
        }

        if (onRegenerate) {
            onRegenerate();
        }
    };

    const handleConfirmClick = async () => {
        if (displayedAnswer && !isTyping) {
            try {
                // Call addQuestion API
                const addQuestionPayload = {
                    question_text: question,
                    answer_text: displayedAnswer,
                    document_type: documentType
                };

                await addQuestion(addQuestionPayload).unwrap();

                console.log('Question and answer saved successfully');

                // Call the original onConfirm callback
                if (onConfirm) {
                    onConfirm();
                }
            } catch (error) {
                console.error('Error saving question and answer:', error);
                // You might want to show an error message to the user here
            }
        }
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayedAnswer(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    const combinedLoading = isLoading || isRefining || isAddingQuestion;

    return (
        <Box sx={{ 
            width: '100%',
            maxWidth: {
                // xs: '100%',
                // sm: '280px',
                // md: '480px',
                // lg: '680px',
                xl: '1200px',
            },
            margin: '0 auto',
        }}>
            <Box
                sx={{
                    backgroundColor: '#FAFAFA',
                    border: '2px solid #D2D2D2',
                    borderRadius: '8px',
                    padding: '11px',
                    marginBottom: '11px',
                    height: "auto",
                    minHeight: {
                        xs: '250px',
                        sm: '300px',
                        md: '320px',
                        lg: '430px',
                        xl: '600px',
                    },
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '&::-webkit-scrollbar': {
                        width: '5px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '7px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#888',
                        borderRadius: '7px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#555',
                    },
                }}
            >
                <Box
                    sx={{
                        background: 'linear-gradient(#FAFAFA, #FAFAFA) padding-box, linear-gradient(135deg, #3EA3FF, #FF3C80) border-box',
                        border: '2px solid transparent',
                        borderRadius: '8px',
                        padding: '13px',
                        overflowX: 'hidden',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <DragIndicatorIcon sx={{ color: '#D9D9D9', fontSize: '16px', flexShrink: 0 }} />
                        <Typography
                            sx={{
                                color: '#8A8787',
                                fontFamily: 'Poppins',
                                fontSize: '13px',
                                fontWeight: 600,
                                marginRight: '5px',
                                flexShrink: 0,
                            }}
                        >
                            {number}
                        </Typography>
                        <Typography
                            sx={{
                                color: '#000',
                                fontFamily: 'Poppins',
                                fontSize: '13px',
                                fontWeight: 600,
                                lineHeight: 'normal',
                                flex: 1,
                            }}
                        >
                            {question}
                        </Typography>
                    </Box>

                    {combinedLoading ? (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '100px',
                            marginBottom: '11px',
                            marginLeft: '32px',
                        }}>
                            <CircularProgress size={30} sx={{ color: '#3EA3FF' }} />
                        </Box>
                    ) : displayedAnswer || isTyping ? (
                        <Box sx={{ marginBottom: '11px', marginLeft: '32px', width: 'calc(100% - 32px)' }}>
                            <TextField
                                fullWidth
                                multiline
                                value={displayedAnswer}
                                onChange={handleAnswerChange}
                                disabled={isTyping}
                                placeholder="Your answer will appear here..."
                                inputRef={answerFieldRef}
                                InputProps={{
                                    sx: {
                                        color: '#000',
                                        fontFamily: 'Poppins',
                                        fontSize: '9px',
                                        fontWeight: 400,
                                        lineHeight: '1.6',
                                        padding: 0,
                                        width: '100%',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: 0,
                                            cursor: isTyping ? 'default' : 'text',
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                            whiteSpace: 'pre-wrap',
                                        },
                                    },
                                }}
                                sx={{
                                    width: '100%',
                                    '& .MuiInputBase-input::placeholder': {
                                        color: '#999',
                                        opacity: 1,
                                        fontFamily: 'Poppins',
                                    },
                                    '& .MuiInputBase-root': {
                                        width: '100%',
                                    },
                                }}
                            />
                        </Box>
                    ) : (
                        <Typography
                            sx={{
                                color: '#999',
                                fontFamily: 'Poppins',
                                fontSize: '9px',
                                fontWeight: 400,
                                lineHeight: '1.6',
                                marginBottom: '11px',
                                marginLeft: '32px',
                            }}
                        >
                            Your answer will appear here...
                        </Typography>
                    )}

                    <Box
                        sx={{
                            height: '1px',
                            backgroundColor: '#D9D9D9',
                            marginBottom: '11px',
                            filter: 'drop-shadow(0 1px 0 #FFF)',
                        }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            startIcon={<RefreshIcon sx={{ fontSize: '12px' }} />}
                            onClick={handleRegenerateClick}
                            disabled={!answer || combinedLoading || isTyping}
                            sx={{
                                color: '#3FA3FF',
                                textTransform: 'none',
                                fontFamily: 'Poppins',
                                fontSize: '9px',
                                fontWeight: 500,
                                padding: '4px 6px',
                                '&:hover': {
                                    backgroundColor: 'rgba(63, 163, 255, 0.1)',
                                },
                                '&:disabled': {
                                    color: '#ccc',
                                },
                            }}
                        >
                            Regenerate
                        </Button>
                        <Button
                            endIcon={<Cammi />}
                            onClick={handleConfirmClick}
                            disabled={!answer || combinedLoading || isTyping}
                            sx={{
                                color: '#FD3D81',
                                textTransform: 'none',
                                fontFamily: 'Poppins',
                                fontSize: '9px',
                                fontWeight: 500,
                                padding: '4px 6px',
                                '&:hover': {
                                    backgroundColor: 'rgba(253, 61, 129, 0.1)',
                                },
                                '&:disabled': {
                                    color: '#ccc',
                                },
                            }}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Box>
            </Box>

            <TextField
                fullWidth
                multiline
                maxRows={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what you want to generate"
                InputProps={{
                    endAdornment: (
                        <IconButton
                            onClick={handleSendClick}
                            disabled={!inputValue.trim() || combinedLoading}
                            sx={{
                                color: '#3EA3FF',
                                padding: '4px',
                                '&:disabled': {
                                    color: '#ccc',
                                },
                            }}
                        >
                            <SendIcon sx={{ fontSize: '13px' }} />
                        </IconButton>
                    ),
                    sx: {
                        fontFamily: 'Poppins',
                        fontSize: '9px',
                        backgroundColor: '#FAFAFA',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                        background: 'linear-gradient(#FAFAFA, #FAFAFA) padding-box, linear-gradient(135deg, #3EA3FF, #FF3C80) border-box',
                        border: '2px solid transparent',
                    },
                }}
                sx={{
                    '& .MuiInputBase-input::placeholder': {
                        color: '#8A8787',
                        opacity: 1,
                        fontFamily: 'Poppins',
                    },
                }}
            />
        </Box>
    );
};

export default UserInput;