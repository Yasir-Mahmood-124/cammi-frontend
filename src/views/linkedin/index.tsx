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
import Cookies from "js-cookie";

interface InputItem {
  id: number;
  question: string;
  answer: string;
}

const Linkedin = () => {
  const [sub, setSub] = useState<string | null>(null);
  const [isCheckingSub, setIsCheckingSub] = useState(true);
  const [hasOrgId, setHasOrgId] = useState(false); // ✅ Track if org_id exists
  const [items, setItems] = useState<InputItem[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(1);
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allAnswered, setAllAnswered] = useState(false);
  const [refine, { isLoading: isRefining }] = useRefineMutation();

  // ✅ Retrieve LinkedIn sub from URL or localStorage FIRST
  useEffect(() => {
    console.log("🔍 Checking for sub...");

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSub = params.get("sub");

      console.log("🔑 URL sub parameter:", urlSub);

      if (urlSub) {
        // console.log("✅ Found sub in URL:", urlSub);
        localStorage.setItem("linkedin_sub", urlSub);
        setSub(urlSub);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else {
        const storedSub = localStorage.getItem("linkedin_sub");
        // console.log("💾 Stored sub from localStorage:", storedSub);
        setSub(storedSub || null);
      }

      // ✅ Check if organization_id exists
      const currentProject = localStorage.getItem("currentProject");
      if (currentProject) {
        try {
          const parsed = JSON.parse(currentProject);
          if (parsed.organization_id) {
            // console.log("✅ Found organization_id:", parsed.organization_id);
            setHasOrgId(true);
          } else {
            console.warn("⚠️ No organization_id in currentProject");
          }
        } catch (err) {
          console.error("❌ Error parsing currentProject:", err);
        }
      } else {
        console.warn("⚠️ No currentProject in localStorage");
      }

      setIsCheckingSub(false);
    }
  }, []);

  // ✅ Only call API when BOTH sub and organization_id exist
  const { data, isLoading, isError, error } = useGetPostQuestionsQuery(
    undefined,
    {
      skip: !sub || !hasOrgId, // Skip if either is missing
    }
  );

  const [insertPostQuestion, { isLoading: isInserting }] =
    useInsertPostQuestionMutation();

  // ✅ Console the API response
  useEffect(() => {
    if (sub && hasOrgId) {
      console.log("📡 API Response:", data);
      console.log("⏳ Loading:", isLoading);
      console.log("❌ Error:", isError);
      if (isError) {
        console.log("🔴 Error details:", error);
      }
    }
  }, [data, isLoading, isError, error, sub, hasOrgId]);

  // ✅ Setup questions when data is fetched
  useEffect(() => {
    if (
      typeof data === "object" &&
      data !== null &&
      "questions" in data &&
      Array.isArray(data.questions) &&
      data.questions.length > 0
    ) {
      console.log("✅ Setting up questions:", data.questions);
      const formatted = data.questions.map((q: string, i: number) => ({
        id: i + 1,
        question: q,
        answer: "",
      }));
      setItems(formatted);
      setCurrentQuestionId(1);
      setAnsweredIds([]);
      setAllAnswered(false);
    }
  }, [data]);

  const currentQuestion = items.find((q) => q.id === currentQuestionId);

  const handleGenerate = async (input: string) => {
    if (!currentQuestion) return;
    setIsGenerating(true);

    try {
      // ✅ Get session_id from cookies (stored as JSON)
      const tokenData = Cookies.get("token");
      let session_id: string | undefined;

      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData);
          session_id = parsed.session_id || parsed; // Handle if stored as plain string
        } catch {
          session_id = tokenData; // Fallback if not JSON
        }
      }

      // ✅ Concatenate question and answer
      const prompt = `${currentQuestion.question}\n${input}`;

      // ✅ Call refine API
      const response = await refine({ prompt, session_id }).unwrap();

      console.log("✅ Refine API Response:", response);

      // ✅ Update the item with refined (AI-generated) response
      const updated = items.map((q) =>
        q.id === currentQuestionId
          ? {
              ...q,
              answer: response.groq_response || "No response from model.",
            }
          : q
      );
      setItems(updated);
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

      console.log("✅ Insert API Response:", response);

      if (!answeredIds.includes(currentQuestionId)) {
        setAnsweredIds([...answeredIds, currentQuestionId]);
      }

      if (currentQuestionId < items.length) {
        setCurrentQuestionId(currentQuestionId + 1);
      } else {
        setAllAnswered(true);
      }
    } catch (error) {
      console.error("❌ Error inserting post question:", error);
    }
  };

  const handleRegenerate = () => {
    handleGenerate(currentQuestion?.question || "");
  };

  const handleItemClick = (id: number) => {
    setCurrentQuestionId(id);
  };

  console.log("🎬 Render state:", {
    isCheckingSub,
    sub,
    hasOrgId,
    isLoading,
    isError,
    hasData: !!data,
  });

  // ✅ Wait for initial sub check to complete
  if (isCheckingSub) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Typography>Initializing...</Typography>
      </Container>
    );
  }

  // ✅ If no sub, show login immediately (no API call happens)
  if (!sub) {
    console.log("🚪 Showing LinkedInLogin (no sub)");
    return <LinkedInLogin />;
  }

  // ✅ If no organization_id, show error or post form
  if (!hasOrgId) {
    console.log("⚠️ No organization_id, showing LinkedInPostForm");
    return <LinkedInPostForm sub={sub} />;
  }

  // ✅ Loading state (only shown when sub exists and API is loading)
  if (isLoading) {
    console.log("⏳ Showing loading (API call in progress)");
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

  console.log("📊 Data state:", {
    hasQuestions,
    isNotFound,
    allAnswered,
    isError,
  });

  // ✅ If API error OR "Not found" OR all answered → show LinkedInPostForm
  if (isError || isNotFound || allAnswered) {
    console.log("📝 Showing LinkedInPostForm (error/not found/completed)");
    return <LinkedInPostForm sub={sub} />;
  }

  // ✅ If no questions and no error → show post form
  if (!hasQuestions) {
    console.log("📝 Showing LinkedInPostForm (no questions)");
    return <LinkedInPostForm sub={sub} />;
  }

  // ✅ Otherwise, show Q&A UI
  console.log("❓ Showing Q&A UI");
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
          isClickable={!isGenerating && !isInserting}
        />
      </Box>
    </Container>
  );
};

export default Linkedin;
