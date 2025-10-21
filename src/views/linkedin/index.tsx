"use client";

import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import LinkedInPostForm from "./LinkedInPostForm";
import LinkedInLogin from "./LinkedInLogin";
import UserInput from "./UserInput";
import InputTakerUpdated from "./InputTakerUpdated";
import { useGetPostQuestionsQuery } from "@/redux/services/linkedin/getPostQuestion";
import { useInsertPostQuestionMutation } from "@/redux/services/linkedin/insertPostQuestion"; // ✅ import mutation

interface InputItem {
  id: number;
  question: string;
  answer: string;
}

const Linkedin = () => {
  const [sub, setSub] = useState<string | null>(null);
  const [items, setItems] = useState<InputItem[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(1);
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allAnswered, setAllAnswered] = useState(false);

  const { data, isLoading, isError } = useGetPostQuestionsQuery();
  const [insertPostQuestion, { isLoading: isInserting }] = useInsertPostQuestionMutation(); // ✅ mutation hook

  // ✅ Console the API response
  useEffect(() => {
    console.log("API Response:", data);
    console.log("Loading:", isLoading);
    console.log("Error:", isError);
  }, [data, isLoading, isError]);

  // ✅ Retrieve LinkedIn sub from URL or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSub = params.get("sub");

      if (urlSub) {
        localStorage.setItem("linkedin_sub", urlSub);
        setSub(urlSub);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        const storedSub = localStorage.getItem("linkedin_sub");
        if (storedSub) setSub(storedSub);
      }
    }
  }, []);

  // ✅ Setup questions when data is fetched
  useEffect(() => {
    if (
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
      setItems(formatted);
      setCurrentQuestionId(1);
      setAnsweredIds([]);
      setAllAnswered(false);
    }
  }, [data]);

  const currentQuestion = items.find((q) => q.id === currentQuestionId);

  // ✅ Mock answer generator (replace with API later)
  const handleGenerate = (input: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const updated = items.map((q) =>
        q.id === currentQuestionId
          ? { ...q, answer: `Generated answer for: "${input}"` }
          : q
      );
      setItems(updated);
      setIsGenerating(false);
    }, 1000);
  };

// ✅ Confirm and insert data into DynamoDB
const handleConfirm = async () => {
  if (!currentQuestion) return;

  try {
    // ✅ Get organization_id from localStorage
    const currentProject = localStorage.getItem("currentProject");
    const parsedProject = currentProject ? JSON.parse(currentProject) : null;
    const organization_id = parsedProject?.organization_id;

    if (!organization_id) {
      console.error("❌ organization_id not found in localStorage.currentProject");
      return;
    }

    // ✅ Call the mutation with the correct organization_id
    const response = await insertPostQuestion({
      organization_id,
      post_question: currentQuestion.question,
      post_answer: currentQuestion.answer,
    }).unwrap();

    console.log("✅ Insert API Response:", response);

    // ✅ Mark question as answered
    if (!answeredIds.includes(currentQuestionId)) {
      setAnsweredIds([...answeredIds, currentQuestionId]);
    }

    // ✅ Move to next or complete
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

  // ✅ Loading state
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <Typography>Loading questions...</Typography>
      </Container>
    );
  }

  // ✅ If "Not found" or no questions → show login
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

  if (!hasQuestions || isNotFound) {
    return <LinkedInLogin />;
  }

  // ✅ Once all questions are answered → show LinkedInPostForm
  if (allAnswered && sub) {
    return <LinkedInPostForm sub={sub} />;
  }

  // ✅ Otherwise, show Q&A UI
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
      {/* Main question section */}
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

      {/* Sidebar list */}
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
