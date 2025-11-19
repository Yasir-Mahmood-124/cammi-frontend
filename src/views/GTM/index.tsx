"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import UserInput from "../ICP/UserInput";
import InputTakerUpdated from "../ICP/InputTakerUpdated";
import FinalPreview from "../ICP/FinalPreview";
import Generating from "../ICP/Generating";
import DocumentPreview from "../ICP/DocumentPreview";
import ArrowUp from "@/assests/icons/ArrowUp.svg";
import { useGet_unanswered_questionsQuery } from "@/redux/services/common/getUnansweredQuestionsApi";
import { useGetQuestionsQuery } from "@/redux/services/common/getQuestionsApi";
import { useRefineMutation } from "@/redux/services/common/refineApi";
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
  setSessionId,
  setIsGenerating,
  setWsUrl,
  setDocumentData,
  setShouldFetchUnanswered,
  setShouldFetchAll,
  setShowDocumentPreview,
  setCompletionMessageReceived,
  setCurrentQuestionIndex,
  setAnsweredIds,
} from "@/redux/services/gtm/gtmSlice";
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

const GTMPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const documentFetchTriggered = useRef(false);
  const mountRecoveryTriggered = useRef(false);
  const previewFetchTriggered = useRef(false);
  const hasInitialFetchHappened = useRef(false);

  // Get state from Redux
  const {
    view,
    questions,
    currentQuestionIndex,
    answeredIds,
    projectId,
    sessionId,
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
  } = useSelector((state: RootState) => state.gtm);

  // Redux mutation hooks
  const [refine, { isLoading: isRefining }] = useRefineMutation();
  const [uploadTextFile, { isLoading: isUploading }] =
    useUploadTextFileMutation();
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
        console.error("❌ [GTM Project] Error parsing currentProject:", error);
      }
    }
  }, [dispatch, projectId]);

  // 🔥 RTK Query for unanswered questions with refetch function
  const {
    data: unansweredData,
    isLoading: isLoadingUnanswered,
    isError: isErrorUnanswered,
    refetch: refetchUnanswered,
  } = useGet_unanswered_questionsQuery(
    {
      project_id: projectId,
      document_type: "gtm",
    },
    {
      skip: !shouldFetchUnanswered || !projectId,
      refetchOnMountOrArgChange: true,
    }
  );

  // 🔥 RTK Query for all questions (answered) with refetch function
  const {
    data: allQuestionsData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    refetch: refetchAllQuestions,
  } = useGetQuestionsQuery(
    {
      project_id: projectId,
      document_type: "gtm",
    },
    {
      skip: !shouldFetchAll || !projectId,
      refetchOnMountOrArgChange: true,
    }
  );

  // 🔥 NEW: Cleanup state when unmounting (user leaves the page)
  useEffect(() => {
    return () => {
      console.log("🧹 [GTM Unmount] Clearing state for fresh fetch on return");
      if (!isGenerating && !showDocumentPreview) {
        dispatch(setQuestions([]));
        dispatch(setCurrentQuestionIndex(0));
        dispatch(setAnsweredIds([]));
        dispatch(setShouldFetchUnanswered(false));
        dispatch(setShouldFetchAll(false));
        hasInitialFetchHappened.current = false;
      }
    };
  }, [dispatch, isGenerating, showDocumentPreview]);

  // 🔥 MODIFIED: Force refetch on every mount
  useEffect(() => {
    if (projectId && !isGenerating && !showDocumentPreview) {
      console.log("📋 [GTM Mount] Force refetching latest unanswered questions from API (bypassing cache)");
      
      setTimeout(() => {
        dispatch(setShouldFetchUnanswered(true));
        
        setTimeout(() => {
          console.log("🔄 [GTM Refetch] Manually triggering refetch to bypass cache");
          refetchUnanswered();
        }, 200);
      }, 100);
    }
  }, [projectId, dispatch, refetchUnanswered]);

  // 🔥 Safety check - Reset currentQuestionIndex if out of bounds
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      console.log("⚠️ [GTM Safety] currentQuestionIndex out of bounds, resetting to 0");
      dispatch(setCurrentQuestionIndex(0));
    }
  }, [questions.length, currentQuestionIndex, dispatch]);

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
        document_type: "gtm",
        project_id: project_id,
      }).unwrap();

      dispatch(
        setDocumentData({
          docxBase64: response.docxBase64,
          fileName: response.fileName || "gtm_document.docx",
        })
      );

      toast.success("Document ready for preview!");
    } catch (error: any) {
      console.error("❌ [GTM Document] Fetch failed:", error);
      toast.error("Failed to fetch document. Please try again.");
      documentFetchTriggered.current = false;
    }
  }, [dispatch, getDocxFile]);

  // ==================== MOUNT RECOVERY WITH WEBSOCKET RE-CONNECTION (ENHANCED) ====================
  useEffect(() => {
    if (mountRecoveryTriggered.current) {
      console.log(
        "↩️ [Recovery] Already triggered during this mount, skipping duplicate"
      );
      return;
    }
    mountRecoveryTriggered.current = true;

    console.log(
      "╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║           🔍 Mount Recovery Check (Enhanced)               ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝"
    );

    if (docxBase64 && fileName) {
      console.log("✅ [Recovery] Document already available in Redux");
      if (!showDocumentPreview) {
        dispatch(setShowDocumentPreview(true));
      }
      return;
    }

    if (hasReceivedCompletionMessage && !docxBase64) {
      console.log(
        "🎯 [Recovery] Completion message found - fetching document!"
      );
      setTimeout(() => {
        handleGenerationComplete();
      }, 1000);
      return;
    }

    if (isGenerating && !hasReceivedCompletionMessage && wsUrl) {
      console.log(
        "⚡ [Recovery] Generation active - restoring progress and WebSocket"
      );
      console.log("  ├─ Progress:", generatingProgress + "%");
      console.log("  ├─ wsUrl:", wsUrl);
      console.log("  └─ Re-triggering WebSocket connection...");

      mountRecoveryTriggered.current = true;

      setTimeout(() => {
        setTimeout(() => {
          dispatch(setIsGenerating(true));
        }, 100);
      }, 500);
      return;
    }

    if (isGenerating && !wsUrl) {
      console.log(
        "⚠️ [Recovery] Stale generation state detected - resetting..."
      );
      dispatch(setIsGenerating(false));
      toast.error("Generation state was interrupted. Please try again.");
      return;
    }

    if (!isGenerating) {
      console.log("✅ [Recovery] No active generation, normal state");
      return;
    }

    console.log("ℹ️ [Recovery] No specific recovery action required");

    return () => {
      console.log("🧹 [Cleanup] Resetting mount recovery flag for next mount");
      mountRecoveryTriggered.current = false;
    };
  }, [
    docxBase64,
    fileName,
    showDocumentPreview,
    hasReceivedCompletionMessage,
    isGenerating,
    generatingProgress,
    wsUrl,
    dispatch,
    handleGenerationComplete,
  ]);

  // Watch for completion message flag changes (backup)
  useEffect(() => {
    if (
      hasReceivedCompletionMessage &&
      !docxBase64 &&
      !documentFetchTriggered.current
    ) {
      handleGenerationComplete();
    }
  }, [hasReceivedCompletionMessage, docxBase64, handleGenerationComplete]);

  // Handle unanswered questions response
  useEffect(() => {
    if (unansweredData) {
      console.log("📥 [GTM API Response] Unanswered questions received:", unansweredData);

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

        console.log(`✅ [GTM] Found ${formattedQuestions.length} unanswered questions`);
        dispatch(setQuestions(formattedQuestions));
        dispatch(setView("questions"));
        dispatch(setShouldFetchUnanswered(false));

        toast.success(
          "Unanswered questions loaded successfully!"
        );
      } else {
        console.log("✅ [GTM] No unanswered questions, fetching all answered questions");
        dispatch(setShouldFetchUnanswered(false));
        dispatch(setShouldFetchAll(true));

        toast.success(
          "No unanswered questions found. Fetching all answered ones..."
        );
      }
    }
  }, [unansweredData, dispatch]);

  // Handle all questions (answered) response
  useEffect(() => {
    if (allQuestionsData && allQuestionsData.questions) {
      console.log("📥 [GTM API Response] All questions received:", allQuestionsData);

      const formattedQuestions: Question[] = allQuestionsData.questions.map(
        (q, index) => ({
          id: index + 1,
          question: q.question_text,
          answer: q.answer_text || "",
        })
      );

      console.log(`✅ [GTM] Loaded ${formattedQuestions.length} answered questions`);
      dispatch(setQuestions(formattedQuestions));
      dispatch(setView("preview"));
      dispatch(setShouldFetchAll(false));

      toast.success("All answered questions loaded successfully!");
    }
  }, [allQuestionsData, dispatch]);

  // 🔥 When transitioning to preview, always fetch from API
  const handleShowPreview = useCallback(() => {
    console.log("📋 [GTM Preview] Triggering API fetch for preview");
    previewFetchTriggered.current = false;
    dispatch(setShouldFetchAll(true));
    
    setTimeout(() => {
      console.log("🔄 [GTM Preview Refetch] Manually triggering refetch to bypass cache");
      refetchAllQuestions();
    }, 200);
  }, [dispatch, refetchAllQuestions]);

  // Check if all questions are answered
  const allQuestionsAnswered =
    questions.length > 0 && questions.every((q) => q.answer.trim() !== "");

  // Handle generating answer from API
  const handleGenerate = async (userPrompt: string) => {
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const fullPrompt = `${currentQuestion.question}\n\n${userPrompt}`;

      const responsePromise = refine({
        prompt: fullPrompt,
        session_id: sessionId,
      }).unwrap();

      const response = await toast.promise(responsePromise, {
        loading: "Generating answer...",
        success: "Answer generated successfully!",
        error: "Failed to generate answer. Please try again.",
      });

      if (response.session_id) {
        dispatch(setSessionId(response.session_id));
      }

      dispatch(updateCurrentQuestionAnswer(response.groq_response));
    } catch (error) {
      // Error already handled by toast.promise
    }
  };

  const handleRegenerate = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    toast("Regenerating answer...", {
      icon: "🔄",
    });
    await handleGenerate(currentQuestion.question);
  };

  const handleConfirm = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.answer) {
      dispatch(addAnsweredId(currentQuestion.id));
      toast.success("Answer confirmed successfully!");

      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
      } else {
        toast.success("All questions answered! Loading preview...");
        handleShowPreview();
      }
    } else {
      toast.error("Please provide an answer before confirming!");
    }
  };

  const handleItemClick = (id: number) => {
    dispatch(goToQuestion(id));
  };

  const handleAnswerUpdate = (id: number, newAnswer: string) => {
    dispatch(updateQuestionAnswer({ id, answer: newAnswer }));
  };

  const handleGenerateDocument = async () => {
    try {
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
        document_type: "gtm",
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
      dispatch(setIsGenerating(true));
    } catch (err: any) {
      console.error("❌ [GTM Upload] Error:", err);
      toast.error("Upload failed. Please try again.");
    }
  };

  const isLoading = isLoadingUnanswered || isLoadingAll;
  const isError = isErrorUnanswered || isErrorAll;
  // const showButton = view === "questions" || view === "preview";
  const showButton = view === "preview";

  const currentQuestion = questions[currentQuestionIndex];
  const hasValidCurrentQuestion = currentQuestion !== undefined;

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

  // 🔥 FIX: Wrap DocumentPreview in a container with defined height
  if (showDocumentPreview && docxBase64) {
    return (
      <Box sx={{ height: 'calc(100vh - 10.96vh)', width: '100%', overflow: 'hidden' }}>
        <DocumentPreview
          docxBase64={docxBase64}
          fileName={fileName}
          documentType="gtm"
        />
      </Box>
    );
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
          <Generating wsUrl={wsUrl} documentType="gtm" />
        </Box>
      ) : (
        <>
          {view === "questions" && questions.length > 0 && hasValidCurrentQuestion && (
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
                <Box sx={{ flex: 1 }}>
                  <UserInput
                    number={currentQuestion.id}
                    question={currentQuestion.question}
                    answer={currentQuestion.answer}
                    documentType="gtm"
                    isLoading={isRefining}
                    onGenerate={handleGenerate}
                    onRegenerate={handleRegenerate}
                    onConfirm={handleConfirm}
                  />
                </Box>

                <Box sx={{ flex: "0 0 300px", height: "100%" }}>
                  <InputTakerUpdated
                    items={questions}
                    currentQuestionId={currentQuestion.id}
                    answeredIds={answeredIds}
                    onItemClick={handleItemClick}
                    isClickable={false}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {view === "preview" && questions.length > 0 && (
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
                <FinalPreview
                  questionsAnswers={questions}
                  onAnswerUpdate={handleAnswerUpdate}
                />
              </Box>
            </Box>
          )}

          {questions.length === 0 && !isLoading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
              }}
            >
              <div style={{ fontFamily: "Poppins", color: "#666" }}>
                Loading questions...
              </div>
            </Box>
          )}

          {showButton && (
            <Box sx={{ position: "fixed", bottom: "28px", right: "70px" }}>
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

export default GTMPage;