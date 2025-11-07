// SRPage.tsx
"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DocumentQuestion from "../ICP/DocumentQuestion";
import UploadDocument from "../ICP/UploadDocument";
import UserInput from "../ICP/UserInput";
import InputTakerUpdated from "../ICP/InputTakerUpdated";
import FinalPreview from "../ICP/FinalPreview";
import Generating from "../ICP/Generating";
import DocumentPreview from "../ICP/DocumentPreview";
import { useGet_unanswered_questionsQuery } from "@/redux/services/common/getUnansweredQuestionsApi";
import { useGetQuestionsQuery } from "@/redux/services/common/getQuestionsApi";
import { useUploadTextFileMutation } from "@/redux/services/common/uploadApiSlice";
import { useGetDocxFileMutation } from "@/redux/services/document/downloadApi";
import { RootState, AppDispatch } from "@/redux/store";
import {
  setView,
  setQuestions,
  updateQuestionAnswer,
  updateCurrentQuestionAnswer,
  nextQuestion,
  goToQuestion,
  addAnsweredId,
  setProjectId,
  setIsGenerating,
  setWsUrl,
  setDocumentData,
  setShouldFetchUnanswered,
  setShouldFetchAll,
  setShowDocumentPreview,
  setCompletionMessageReceived,
} from "@/redux/services/sr/srSlice";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";

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
  const dispatch = useDispatch<AppDispatch>();
  const documentFetchTriggered = useRef(false);
  const mountRecoveryTriggered = useRef(false);

  // Get state from Redux
  const {
    view,
    questions,
    currentQuestionIndex,
    answeredIds,
    projectId,
    isGenerating,
    wsUrl,
    showDocumentPreview,
    docxBase64,
    fileName,
    shouldFetchUnanswered,
    shouldFetchAll,
    generatingProgress,
    generatingContent,
    hasReceivedCompletionMessage,
    displayedContent,
  } = useSelector((state: RootState) => state.sr);

  // Redux mutation hooks
  const [uploadTextFile, { isLoading: isUploading }] = useUploadTextFileMutation();
  const [getDocxFile, { isLoading: isDownloading }] = useGetDocxFileMutation();

  // Get project_id from localStorage on component mount
  useEffect(() => {
    const currentProjectStr = localStorage.getItem("currentProject");
    if (currentProjectStr) {
      try {
        const currentProject: CurrentProject = JSON.parse(currentProjectStr);
        if (currentProject.project_id !== projectId) {
          dispatch(setProjectId(currentProject.project_id));
        }
      } catch (error) {
        console.error("❌ [SR Project] Error parsing currentProject:", error);
      }
    }
  }, [dispatch, projectId]);

  // Setup WebSocket URL for upload
  useEffect(() => {
    if (!wsUrl) {
      const websocketUrl = "wss://91vm5ilj37.execute-api.us-east-1.amazonaws.com/dev";
      dispatch(setWsUrl(websocketUrl));
    }
  }, [dispatch, wsUrl]);

  // Fetch document function
  const handleGenerationComplete = useCallback(async () => {
    if (documentFetchTriggered.current) {
      return;
    }

    documentFetchTriggered.current = true;

    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      const response = await getDocxFile({
        session_id: savedToken || "",
        document_type: "sr",
        project_id: project_id,
      }).unwrap();

      dispatch(
        setDocumentData({
          docxBase64: response.docxBase64,
          fileName: response.fileName || "sr_document.docx",
        })
      );

      toast.success("Document ready for preview!");
    } catch (error: any) {
      console.error("❌ [SR Document] Fetch failed:", error);
      toast.error("Failed to fetch document. Please try again.");
      documentFetchTriggered.current = false; // Reset on error to allow retry
    }
  }, [dispatch, getDocxFile]);

  // ==================== SIMPLE MOUNT RECOVERY ====================
  useEffect(() => {
    if (mountRecoveryTriggered.current) {
      return;
    }

    // Scenario 1: Document already fetched and available
    if (docxBase64 && fileName) {
      if (!showDocumentPreview) {
        dispatch(setShowDocumentPreview(true));
      }
      mountRecoveryTriggered.current = true;
      return;
    }

    // Scenario 2: Completion message received but no document yet - FETCH IT!
    if (hasReceivedCompletionMessage && !docxBase64) {
      mountRecoveryTriggered.current = true;
      
      setTimeout(() => {
        handleGenerationComplete();
      }, 1000);
      return;
    }

    // Scenario 3: Generation in progress - global middleware is handling it
    if (isGenerating && generatingProgress >= 0 && !hasReceivedCompletionMessage) {
      mountRecoveryTriggered.current = true;
      return;
    }

    // Scenario 4: No active generation
    if (!isGenerating) {
      mountRecoveryTriggered.current = true;
      return;
    }

    mountRecoveryTriggered.current = true;
  }, []); // Run only once on mount

  // Watch for completion message flag changes (backup)
  useEffect(() => {
    if (hasReceivedCompletionMessage && !docxBase64 && !documentFetchTriggered.current) {
      handleGenerationComplete();
    }
  }, [hasReceivedCompletionMessage, docxBase64, handleGenerationComplete]);

  // RTK Query for unanswered questions
  const {
    data: unansweredData,
    isLoading: isLoadingUnanswered,
    isError: isErrorUnanswered,
  } = useGet_unanswered_questionsQuery(
    {
      project_id: projectId,
      document_type: "sr",
    },
    {
      skip: !shouldFetchUnanswered || !projectId,
    }
  );

  // RTK Query for all questions (answered)
  const {
    data: allQuestionsData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useGetQuestionsQuery(
    {
      project_id: projectId,
      document_type: "sr",
    },
    {
      skip: !shouldFetchAll || !projectId,
    }
  );

  // Handle unanswered questions response
  useEffect(() => {
    if (unansweredData) {
      toast.loading("Checking for unanswered questions...");

      if (
        unansweredData.missing_questions &&
        unansweredData.missing_questions.length > 0
      ) {
        const formattedQuestions: Question[] =
          unansweredData.missing_questions.map((q, index) => ({
            id: index + 1,
            question: q,
            answer: "",
          }));

        dispatch(setQuestions(formattedQuestions));
        dispatch(setView("questions"));
        dispatch(setShouldFetchUnanswered(false));

        toast.dismiss();
        toast.success(
          `${formattedQuestions.length} unanswered question(s) found. Please provide answers.`
        );
      } else {
        dispatch(setShouldFetchUnanswered(false));
        dispatch(setShouldFetchAll(true));

        toast.dismiss();
        toast.success(
          "No unanswered questions found. Fetching all answered ones..."
        );
      }
    }
  }, [unansweredData, dispatch]);

  // Handle all questions (answered) response
  useEffect(() => {
    if (allQuestionsData && allQuestionsData.questions) {
      toast.loading("Loading all answered questions...");

      const formattedQuestions: Question[] = allQuestionsData.questions.map(
        (q, index) => ({
          id: index + 1,
          question: q.question_text,
          answer: q.answer_text || "",
        })
      );

      dispatch(setQuestions(formattedQuestions));
      dispatch(setView("preview"));
      dispatch(setShouldFetchAll(false));

      toast.dismiss();
      toast.success("All answered questions loaded successfully!");
    }
  }, [allQuestionsData, dispatch]);

  // Check if all questions are answered
  const allQuestionsAnswered =
    questions.length > 0 && questions.every((q) => q.answer.trim() !== "");

  const handleYesClick = () => {
    dispatch(setView("upload"));
  };

  const handleNoClick = () => {
    dispatch(setShouldFetchUnanswered(true));
  };

  const handleUploadComplete = (data: any) => {
    if (data.status === "processing_started") {
      return;
    }

    if (data.status === "analyzing_document") {
      toast("Analyzing your document...");
      return;
    }

    if (data.status === "questions_need_answers" && data.not_found_questions) {
      const formattedQuestions: Question[] = data.not_found_questions.map(
        (item: any, index: number) => {
          const questionText = item.question || item.question_text || item;
          return {
            id: index + 1,
            question:
              typeof questionText === "string"
                ? questionText
                : String(questionText),
            answer: "",
          };
        }
      );

      dispatch(setQuestions(formattedQuestions));
      dispatch(setView("questions"));
      return;
    }

    if (data.status === "processing_complete") {
      toast.success("Processing complete!");

      if (data.results) {
        const notFoundQuestions = Object.entries(data.results)
          .filter(([_, answer]) => answer === "Not Found")
          .map(([question, _], index) => ({
            id: index + 1,
            question: question,
            answer: "",
          }));

        if (notFoundQuestions.length > 0) {
          dispatch(setQuestions(notFoundQuestions));
          dispatch(setView("questions"));
          toast("Some questions need answers. Please review them.");
        } else {
          dispatch(setShouldFetchAll(true));
        }
      } else {
        dispatch(setShouldFetchAll(true));
        toast.success("Processing complete — moving to preview.");
      }
      return;
    }

    if (data.message === "Forbidden" || data.status === "error") {
      toast.error(
        `WebSocket Error: ${data.message || "Something went wrong."}`
      );
      return;
    }
  };

  const handleGenerate = (generatedAnswer: string) => {
    dispatch(updateCurrentQuestionAnswer(generatedAnswer));
  };

  const handleRegenerate = () => {
    // console.log('Regenerate answer');
  };

  const handleConfirm = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.answer) {
      dispatch(addAnsweredId(currentQuestion.id));
      toast.success("Answer confirmed successfully!");

      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
      } else {
        toast.success("All questions answered! Previewing your responses...");
        dispatch(setView("preview"));
      }
    } else {
      toast.error("Please provide an answer before confirming!");
    }
  };

  const handleItemClick = (id: number) => {
    dispatch(goToQuestion(id));
  };

  const handleBackToQuestions = () => {
    dispatch(setView("questions"));
  };

  const handleAnswerUpdate = (id: number, newAnswer: string) => {
    dispatch(updateQuestionAnswer({ id, answer: newAnswer }));
  };

  const handleGenerateDocument = async () => {
    try {
      // Reset flags
      documentFetchTriggered.current = false;
      mountRecoveryTriggered.current = false;

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

      const uploadPromise = uploadTextFile(payload).unwrap();

      await toast.promise(uploadPromise, {
        loading: "Uploading your answers...",
        success:
          "Answers uploaded successfully! Starting document generation...",
        error: "Failed to upload answers. Please try again.",
      });

      const websocketUrl = `wss://4iqvtvmxle.execute-api.us-east-1.amazonaws.com/prod/?session_id=${savedToken}`;

      dispatch(setWsUrl(websocketUrl));
      dispatch(setIsGenerating(true)); // This triggers the global middleware!
    } catch (err: any) {
      console.error("❌ [SR Upload] Error:", err);
      toast.error("Upload failed. Please try again.");
    }
  };

  const isLoading = isLoadingUnanswered || isLoadingAll;
  const isError = isErrorUnanswered || isErrorAll;
  const showButton = view === "questions" || view === "preview";

  if (isError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div style={{ color: "red", fontFamily: "Poppins" }}>
          Error loading questions. Please try again.
        </div>
      </Box>
    );
  }

  if (showDocumentPreview && docxBase64) {
    return <DocumentPreview docxBase64={docxBase64} fileName={fileName} documentType="sr" />;
  }

  return (
    <Box
      sx={{
        backgroundColor: "#EFF1F5",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {isGenerating ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Generating wsUrl={wsUrl} documentType="sr" />
        </Box>
      ) : (
        <>
          {view === "initial" && (
            <DocumentQuestion
              onYesClick={handleYesClick}
              onNoClick={handleNoClick}
              isLoading={isLoading}
            />
          )}

          {view === "upload" && (
            <UploadDocument
              document_type="sr"
              wsUrl={wsUrl}
              onUploadComplete={handleUploadComplete}
            />
          )}

          {view === "questions" && questions.length > 0 && (
            <Box sx={{ width: "100%", maxWidth: "1200px" }}>
              <Box
                sx={{
                  display: "flex",
                  gap: "24px",
                  width: "100%",
                  alignItems: "flex-start",
                  height: "100%",
                  maxHeight: "500px",
                }}
              >
                <Box sx={{ flex: 1, height: "100vh" }}>
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

                <Box sx={{ flex: "0 0 300px", height: "100%" }}>
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

          {view === "preview" && (
            <Box
              sx={{
                width: "100%",
                maxWidth: "1200px",
                display: "flex",
                justifyContent: "flex-start",
                paddingLeft: "20px",
              }}
            >
              <Box sx={{ width: "100%", maxWidth: "900px" }}>
                {questions.some((q) => q.answer === "") && (
                  <Button
                    onClick={handleBackToQuestions}
                    sx={{
                      color: "#3EA3FF",
                      textTransform: "none",
                      fontFamily: "Poppins",
                      fontSize: "14px",
                      fontWeight: 500,
                      marginBottom: "16px",
                      "&:hover": {
                        backgroundColor: "rgba(62, 163, 255, 0.1)",
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
            <Box sx={{ position: "fixed", bottom: "25px", right: "60px" }}>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon sx={{ fontSize: "14px" }} />}
                onClick={handleGenerateDocument}
                disabled={
                  view !== "preview" || !allQuestionsAnswered || isUploading
                }
                sx={{
                  background: "linear-gradient(135deg, #3EA3FF, #FF3C80)",
                  color: "#fff",
                  textTransform: "none",
                  fontFamily: "Poppins",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "10px 20px",
                  borderRadius: "10px",
                  boxShadow: "0 3px 8px rgba(62, 163, 255, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2E8FE6, #E6356D)",
                  },
                  "&:disabled": {
                    background: "#ccc",
                    color: "#666",
                  },
                }}
              >
                {isUploading ? "Uploading..." : "Generate Document"}
              </Button>
            </Box>
          )}
        </>
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </Box>
  );
};

export default SRPage;