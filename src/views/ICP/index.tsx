"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DocumentQuestion from "./DocumentQuestion";
import UploadDocument from "./UploadDocument";
import UserInput from "./UserInput";
import InputTakerUpdated from "./InputTakerUpdated";
import FinalPreview from "./FinalPreview";
import Generating from "./Generating";
import DocumentPreview from "./DocumentPreview";
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
} from "@/redux/services/icp/icpSlice";
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

const ICPPage: React.FC = () => {
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
  } = useSelector((state: RootState) => state.icp);

  // Redux mutation hooks
  const [uploadTextFile, { isLoading: isUploading }] =
    useUploadTextFileMutation();
  const [getDocxFile, { isLoading: isDownloading }] = useGetDocxFileMutation();

  // ==================== CONSOLE LOG ALL REDUX STATE ON MOUNT ====================
  // useEffect(() => {
  //   console.log("╔════════════════════════════════════════════════════════════╗");
  //   console.log("║           🔄 ICPPage Component Mounted                      ║");
  //   console.log("╚════════════════════════════════════════════════════════════╝");
  //   console.log("📦 [Redux State] Complete ICP State:");
  //   console.log("  ├─ isGenerating:", isGenerating);
  //   console.log("  ├─ generatingProgress:", generatingProgress + "%");
  //   console.log("  ├─ generatingContent length:", generatingContent.length, "chars");
  //   console.log("  ├─ displayedContent length:", displayedContent.length, "chars");
  //   console.log("  ├─ hasReceivedCompletionMessage:", hasReceivedCompletionMessage);
  //   console.log("  ├─ docxBase64 exists:", !!docxBase64);
  //   console.log("  ├─ fileName:", fileName);
  //   console.log("  ├─ showDocumentPreview:", showDocumentPreview);
  //   console.log("  ├─ view:", view);
  //   console.log("  ├─ projectId:", projectId);
  //   console.log("  └─ wsUrl:", wsUrl);
  //   console.log("════════════════════════════════════════════════════════════");
  // }, []);

  // Get project_id from localStorage on component mount
  useEffect(() => {
    const currentProjectStr = localStorage.getItem("currentProject");
    if (currentProjectStr) {
      try {
        const currentProject: CurrentProject = JSON.parse(currentProjectStr);
        if (currentProject.project_id !== projectId) {
          // console.log("📝 [Project] Setting project ID:", currentProject.project_id);
          dispatch(setProjectId(currentProject.project_id));
        }
      } catch (error) {
        // console.error("❌ [Project] Error parsing currentProject:", error);
      }
    }
  }, [dispatch, projectId]);

  // Setup WebSocket URL for upload
  useEffect(() => {
    if (!wsUrl) {
      const websocketUrl =
        "wss://91vm5ilj37.execute-api.us-east-1.amazonaws.com/dev";
      // console.log("🔗 [WebSocket] Setting upload WebSocket URL");
      dispatch(setWsUrl(websocketUrl));
    }
  }, [dispatch, wsUrl]);

  // Fetch document function
  const handleGenerationComplete = useCallback(async () => {
    if (documentFetchTriggered.current) {
      // console.log("⏭️ [Document] Fetch already triggered, skipping...");
      return;
    }

    documentFetchTriggered.current = true;
    // console.log("📥 [Document] Starting document fetch...");

    try {
      const savedToken = Cookies.get("token");
      const project_id = JSON.parse(
        localStorage.getItem("currentProject") || "{}"
      ).project_id;

      // console.log("📤 [Document] Fetching with:", { project_id, document_type: "icp" });

      const response = await getDocxFile({
        session_id: savedToken || "",
        document_type: "icp",
        project_id: project_id,
      }).unwrap();

      // console.log("✅ [Document] Fetch successful!");
      // console.log("  ├─ fileName:", response.fileName);
      // console.log("  └─ docxBase64 length:", response.docxBase64?.length || 0);

      dispatch(
        setDocumentData({
          docxBase64: response.docxBase64,
          fileName: response.fileName || "icp_document.docx",
        })
      );

      toast.success("Document ready for preview!");
    } catch (error: any) {
      // console.error("❌ [Document] Fetch failed:", error);
      // console.error("  ├─ Status:", error?.status);
      // console.error("  └─ Message:", error?.data?.message || error?.message);

      toast.error("Failed to fetch document. Please try again.");
      documentFetchTriggered.current = false; // Reset on error to allow retry
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

    // 🧩 Scenario 1: Document already fetched and available
    if (docxBase64 && fileName) {
      console.log("✅ [Recovery] Document already available in Redux");
      if (!showDocumentPreview) {
        dispatch(setShowDocumentPreview(true));
      }
      return;
    }

    // 🧩 Scenario 2: Completion message received but no document yet - FETCH IT!
    if (hasReceivedCompletionMessage && !docxBase64) {
      console.log(
        "🎯 [Recovery] Completion message found - fetching document!"
      );
      setTimeout(() => {
        handleGenerationComplete();
      }, 1000);
      return;
    }

    // 🧩 Scenario 3: Generation in progress - RE-ESTABLISH WEBSOCKET CONNECTION
    if (isGenerating && !hasReceivedCompletionMessage && wsUrl) {
      console.log(
        "⚡ [Recovery] Generation active - restoring progress and WebSocket"
      );
      console.log("  ├─ Progress:", generatingProgress + "%");
      console.log("  ├─ wsUrl:", wsUrl);
      console.log("  └─ Re-triggering WebSocket connection...");

      mountRecoveryTriggered.current = true;

      // 🔄 Re-trigger the middleware by toggling isGenerating
      setTimeout(() => {
        // dispatch(setIsGenerating(false));
        setTimeout(() => {
          dispatch(setIsGenerating(true));
        }, 100);
      }, 500);
      return;
    }

    // 🧩 Scenario 4: Stale generation state (no wsUrl but isGenerating true)
    if (isGenerating && !wsUrl) {
      console.log(
        "⚠️ [Recovery] Stale generation state detected - resetting..."
      );
      dispatch(setIsGenerating(false));
      toast.error("Generation state was interrupted. Please try again.");
      return;
    }

    // 🧩 Scenario 5: No active generation
    if (!isGenerating) {
      console.log("✅ [Recovery] No active generation, normal state");
      return;
    }

    console.log("ℹ️ [Recovery] No specific recovery action required");

    // 🧹 CLEANUP — allows this effect to run again when user revisits this page
    return () => {
      console.log("🧹 [Cleanup] Resetting mount recovery flag for next mount");
      mountRecoveryTriggered.current = true;
    };
  }, [
    // Dependencies to handle re-mounts properly:
    docxBase64,
    fileName,
    showDocumentPreview,
    hasReceivedCompletionMessage,
    isGenerating,
    generatingProgress,
    wsUrl,
  ]);

  // Watch for completion message flag changes (backup)
  useEffect(() => {
    if (
      hasReceivedCompletionMessage &&
      !docxBase64 &&
      !documentFetchTriggered.current
    ) {
      // console.log("🎯 [Watch] Completion message flag detected - fetching document");
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
      document_type: "icp",
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
      document_type: "icp",
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

      // console.log("╔════════════════════════════════════════════════════════════╗");
      // console.log("║           🚀 Starting Document Generation                  ║");
      // console.log("╚════════════════════════════════════════════════════════════╝");

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
        document_type: "icp",
      };

      // console.log("📤 [Upload] Uploading answers...");
      const uploadPromise = uploadTextFile(payload).unwrap();

      await toast.promise(uploadPromise, {
        loading: "Uploading your answers...",
        success:
          "Answers uploaded successfully! Starting document generation...",
        error: "Failed to upload answers. Please try again.",
      });

      const websocketUrl = `wss://4iqvtvmxle.execute-api.us-east-1.amazonaws.com/prod/?session_id=${savedToken}`;

      // console.log("🔗 [WebSocket] Setting generation WebSocket URL");
      // console.log("🔄 [Redux] Setting isGenerating to true");
      // console.log("🌐 [Info] Global WebSocket middleware will handle all messages");

      dispatch(setWsUrl(websocketUrl));
      dispatch(setIsGenerating(true)); // This triggers the global middleware!
    } catch (err: any) {
      // console.error("❌ [Upload] Error:", err);
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
    // console.log("📄 [Render] Showing DocumentPreview component");
    return (
      <DocumentPreview
        docxBase64={docxBase64}
        fileName={fileName}
        documentType="icp"
      />
    );
  }

  // console.log("🎨 [Render] Main layout - isGenerating:", isGenerating);

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
          <Generating wsUrl={wsUrl} documentType="icp" />
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
              document_type="icp"
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
                <Box sx={{ flex: 1 }}>
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

                <Box sx={{ flex: "0 0 300px", height: "100%" }}>
                  <InputTakerUpdated
                    items={questions}
                    currentQuestionId={questions[currentQuestionIndex].id}
                    answeredIds={answeredIds}
                    onItemClick={handleItemClick}
                    isClickable={false}
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
            <Box sx={{ position: "fixed", bottom: "35px", right: "70px" }}>
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

export default ICPPage;
