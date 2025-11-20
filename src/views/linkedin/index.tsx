// src/views/linkedin/index.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import LinkedInPostForm from "./LinkedInPostForm";
import LinkedInLogin from "./LinkedInLogin";
import UserInput from "./UserInput";
import InputTakerUpdated from "./InputTakerUpdated";
import { useGetPostQuestionsQuery } from "@/redux/services/linkedin/getPostQuestion";
import { useInsertPostQuestionMutation } from "@/redux/services/linkedin/insertPostQuestion";
import { useRefineMutation } from "@/redux/services/common/refineApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setSub,
  setHasOrgId,
  setItems,
  updateItemAnswer,
  setCurrentQuestionId,
  addAnsweredId,
  nextQuestion,
  setAllAnswered,
  resetQuestions,
} from "@/redux/services/linkedin/linkedinSlice";
import Cookies from "js-cookie";

const Linkedin: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Get state from Redux with default values
  const {
    sub,
    hasOrgId,
    items = [], // ✅ Default to empty array
    currentQuestionId,
    answeredIds = [], // ✅ Default to empty array
    allAnswered,
    isQuestionsLoaded,
  } = useAppSelector((state) => state.linkedin || {
    sub: null,
    hasOrgId: false,
    items: [],
    currentQuestionId: 1,
    answeredIds: [],
    allAnswered: false,
    isQuestionsLoaded: false,
  });

  const [isCheckingSub, setIsCheckingSub] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [refine, { isLoading: isRefining }] = useRefineMutation();

  // ✅ Retrieve LinkedIn sub from URL or localStorage FIRST
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSub = params.get("sub");

      if (urlSub) {
        localStorage.setItem("linkedin_sub", urlSub);
        dispatch(setSub(urlSub));
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else {
        const storedSub = localStorage.getItem("linkedin_sub");
        if (storedSub && !sub) {
          dispatch(setSub(storedSub));
        }
      }

      // ✅ Check if organization_id exists
      const currentProject = localStorage.getItem("currentProject");
      if (currentProject) {
        try {
          const parsed = JSON.parse(currentProject);
          if (parsed.organization_id) {
            dispatch(setHasOrgId(true));
          }
        } catch (err) {
          console.error("❌ Error parsing currentProject:", err);
        }
      }

      setIsCheckingSub(false);
    }
  }, [dispatch, sub]);

  // ✅ Only call API when BOTH sub and organization_id exist AND questions not loaded
  const shouldSkipQuery = !sub || !hasOrgId || isQuestionsLoaded;
  
  const { data, isLoading, isError, error } = useGetPostQuestionsQuery(
    undefined,
    {
      skip: shouldSkipQuery,
    }
  );

  const [insertPostQuestion, { isLoading: isInserting }] =
    useInsertPostQuestionMutation();

  // ✅ Setup questions when data is fetched (only if not already loaded)
  useEffect(() => {
    if (
      !isQuestionsLoaded &&
      typeof data === "object" &&
      data !== null &&
      "questions" in data &&
      Array.isArray(data.questions) &&
      data.questions.length > 0
    ) {
      const formatted = data.questions.map((q: string, i: number) => ({
        id: i + 1,
        question: q,
        answer: "",
      }));
      dispatch(setItems(formatted));
    }
  }, [data, isQuestionsLoaded, dispatch]);

  // ✅ Safe check for currentQuestion with optional chaining
  const currentQuestion = items?.find((q) => q.id === currentQuestionId);

  const handleGenerate = async (input: string) => {
    if (!currentQuestion) return;
    setIsGenerating(true);

    try {
      // ✅ Get session_id from cookies
      const tokenData = Cookies.get("token");
      let session_id: string | undefined;

      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData);
          session_id = parsed.session_id || parsed;
        } catch {
          session_id = tokenData;
        }
      }

      // ✅ Concatenate question and answer
      const prompt = `${currentQuestion.question}\n${input}`;

      // ✅ Call refine API
      const response = await refine({ prompt, session_id }).unwrap();

      // ✅ Update the item with refined response
      dispatch(
        updateItemAnswer({
          id: currentQuestionId,
          answer: response.groq_response || "No response from model.",
        })
      );
    } catch (error) {
      console.error("❌ Error during refinement:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!currentQuestion) return;

    try {
      const currentProject = localStorage.getItem("currentProject");
      const parsedProject = currentProject ? JSON.parse(currentProject) : null;
      const organization_id = parsedProject?.organization_id;

      if (!organization_id) {
        console.error(
          "❌ organization_id not found in localStorage.currentProject"
        );
        return;
      }

      const response = await insertPostQuestion({
        organization_id,
        post_question: currentQuestion.question,
        post_answer: currentQuestion.answer,
      }).unwrap();

      // ✅ Add to answered IDs
      dispatch(addAnsweredId(currentQuestionId));

      // ✅ Move to next question or mark all as answered
      if (currentQuestionId < items.length) {
        dispatch(nextQuestion());
      } else {
        dispatch(setAllAnswered(true));
      }
    } catch (error) {
      console.error("❌ Error inserting post question:", error);
    }
  };

  const handleRegenerate = () => {
    handleGenerate(currentQuestion?.question || "");
  };

  const handleItemClick = (id: number) => {
    dispatch(setCurrentQuestionId(id));
  };

  // ✅ Wait for initial sub check to complete
  if (isCheckingSub) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Typography>Initializing...</Typography>
      </Container>
    );
  }

  // ✅ If no sub, show login immediately
  if (!sub) {
    return <LinkedInLogin />;
  }

  // ✅ If no organization_id, show post form
  if (!hasOrgId) {
    return <LinkedInPostForm sub={sub} />;
  }

  // ✅ Loading state (only when fetching questions for the first time)
  if (isLoading && !isQuestionsLoaded) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Typography>Loading questions...</Typography>
      </Container>
    );
  }

  // ✅ Check if questions exist
  const hasQuestions =
    typeof data === "object" &&
    data !== null &&
    "questions" in data &&
    Array.isArray((data as any).questions) &&
    (data as any).questions.length > 0;

  const isNotFound =
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    (data as any).message === "Not found";

  // ✅ If all answered or no questions, show post form
  if (allAnswered || isNotFound || (isQuestionsLoaded && items.length === 0)) {
    return <LinkedInPostForm sub={sub} />;
  }

  // ✅ If questions are loaded and available, show Q&A UI
  if (isQuestionsLoaded && items && items.length > 0) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          display: "flex",
          gap: 4,
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {currentQuestion && (
            <UserInput
              number={currentQuestion.id}
              question={currentQuestion.question}
              answer={currentQuestion.answer}
              isLoading={isGenerating || isInserting}
              onGenerate={handleGenerate}
              onRegenerate={handleRegenerate}
              onConfirm={handleConfirm}
            />
          )}
        </Box>

        <Box sx={{ flex: "0 0 260px" }}>
          <InputTakerUpdated
            items={items}
            currentQuestionId={currentQuestionId}
            answeredIds={answeredIds}
            onItemClick={handleItemClick}
            isClickable={false}
          />
        </Box>
      </Container>
    );
  }

  // ✅ If error and no questions loaded, show post form
  if (isError && !isQuestionsLoaded) {
    return <LinkedInPostForm sub={sub} />;
  }

  // ✅ Default fallback
  return <LinkedInPostForm sub={sub} />;
};

export default Linkedin;