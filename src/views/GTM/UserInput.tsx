"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Cammi } from '@/assests/icons';

interface UserInputProps {
  number: number;
  question: string;
  answer: string;
  isLoading?: boolean;
  onGenerate?: (prompt: string) => void;
  onRegenerate?: () => void;
  onConfirm?: () => void;
}

const UserInput: React.FC<UserInputProps> = ({ 
  number, 
  question, 
  answer,
  isLoading = false,
  onGenerate,
  onRegenerate, 
  onConfirm
}) => {
  const [inputValue, setInputValue] = useState('');
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
    }, 20); // Adjust speed here (milliseconds per character)

    return () => clearInterval(typingInterval);
  }, [answer]);

  const handleSendClick = () => {
    if (inputValue.trim() && onGenerate) {
      onGenerate(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '700px', height: "100%", maxHeight: "505px" }}>
      <Box
        sx={{
          backgroundColor: '#FAFAFA',
          border: '2px solid #D2D2D2',
          borderRadius: '8px',
          padding: '11px',
          marginBottom: '11px',
          height: "100%",
          maxHeight: '483px',
          overflowY: 'auto',
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

          {isLoading ? (
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
          ) : (
            <Typography
              sx={{
                color: '#000',
                fontFamily: 'Poppins',
                fontSize: '9px',
                fontWeight: 400,
                lineHeight: '1.6',
                marginBottom: '11px',
                marginLeft: '32px',
              }}
            >
              {displayedAnswer || 'Your answer will appear here...'}
              {isTyping && <span style={{ opacity: 0.5 }}>▊</span>}
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
              onClick={onRegenerate}
              disabled={!answer || isLoading || isTyping}
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
              onClick={onConfirm}
              disabled={!answer || isLoading || isTyping}
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
              disabled={!inputValue.trim() || isLoading}
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