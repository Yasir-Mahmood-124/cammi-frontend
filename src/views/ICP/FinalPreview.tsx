"use client";

import React, { useState } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

interface QuestionAnswer {
  id: number;
  question: string;
  answer: string;
}

interface FinalPreviewProps {
  questionsAnswers: QuestionAnswer[];
  onAnswerUpdate?: (id: number, newAnswer: string) => void;
}

const FinalPreview: React.FC<FinalPreviewProps> = ({
  questionsAnswers,
  onAnswerUpdate,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedAnswer, setEditedAnswer] = useState<string>("");

  const handleEditClick = (id: number, currentAnswer: string) => {
    setEditingId(id);
    setEditedAnswer(currentAnswer);
  };

  const handleSaveClick = (id: number) => {
    if (onAnswerUpdate) {
      onAnswerUpdate(id, editedAnswer);
    }
    setEditingId(null);
    setEditedAnswer("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedAnswer("");
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: {
          xs: "100%", // mobile: full width
          sm: "600px", // small screens
          md: "700px", // medium screens (14" laptops)
          lg: "700px", // large screens
          xl: "1200px", // extra large screens
        },
        height: "calc(100vh - 18vh)", // Full height minus padding/margins
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#FAFAFA",
          border: "2px solid #D2D2D2",
          borderRadius: "8px",
          padding: "16px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            color: "#000",
            fontFamily: "Poppins",
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "16px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          Final Preview
        </Typography>

        {/* Scrollable content area */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "auto",
            flex: 1,
            paddingRight: "8px",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#F1F1F1",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#C4C4C4",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#A0A0A0",
            },
          }}
        >
          {questionsAnswers.map((qa) => (
            <Box
              key={qa.id}
              sx={{
                background:
                  "linear-gradient(#FAFAFA, #FAFAFA) padding-box, linear-gradient(135deg, #3EA3FF, #FF3C80) border-box",
                border: "2px solid transparent",
                borderRadius: "8px",
                padding: "13px",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <DragIndicatorIcon
                  sx={{ color: "#D9D9D9", fontSize: "16px", flexShrink: 0 }}
                />
                <Typography
                  sx={{
                    color: "#8A8787",
                    fontFamily: "Poppins",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginRight: "5px",
                    flexShrink: 0,
                  }}
                >
                  {qa.id}
                </Typography>
                <Typography
                  sx={{
                    color: "#000",
                    fontFamily: "Poppins",
                    fontSize: "13px",
                    fontWeight: 600,
                    lineHeight: "normal",
                    flex: 1,
                  }}
                >
                  {qa.question}
                </Typography>
                <IconButton
                  onClick={() => {
                    if (editingId === qa.id) {
                      handleSaveClick(qa.id);
                    } else {
                      handleEditClick(qa.id, qa.answer);
                    }
                  }}
                  sx={{
                    padding: "4px",
                    color: editingId === qa.id ? "#4CAF50" : "#3EA3FF",
                    "&:hover": {
                      backgroundColor:
                        editingId === qa.id
                          ? "rgba(76, 175, 80, 0.1)"
                          : "rgba(62, 163, 255, 0.1)",
                    },
                  }}
                >
                  {editingId === qa.id ? (
                    <CheckIcon sx={{ fontSize: "16px" }} />
                  ) : (
                    <EditIcon sx={{ fontSize: "16px" }} />
                  )}
                </IconButton>
              </Box>

              {editingId === qa.id ? (
                <Box sx={{ marginLeft: "32px", marginTop: "8px" }}>
                  <TextField
                    multiline
                    fullWidth
                    minRows={3}
                    maxRows={10}
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    autoFocus
                    sx={{
                      "& .MuiInputBase-root": {
                        fontFamily: "Poppins",
                        fontSize: "9px",
                        fontWeight: 400,
                        lineHeight: "1.6",
                        color: "#000",
                        padding: "8px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#3EA3FF",
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#3EA3FF",
                      },
                    }}
                  />
                </Box>
              ) : (
                <Typography
                  sx={{
                    color: "#000",
                    fontFamily: "Poppins",
                    fontSize: "9px",
                    fontWeight: 400,
                    lineHeight: "1.6",
                    marginLeft: "32px",
                    marginTop: "8px",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {qa.answer}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FinalPreview;
