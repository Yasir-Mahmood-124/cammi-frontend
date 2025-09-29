"use client";

import React, { useState } from "react";
import { Box, Container, Paper, Typography, Button, Card } from "@mui/material";
import Image from "next/image";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import Logo from "@/assests/images/Logo.png";
import { onboardingData } from "../../../const/data";
import { useSubmitAnswerMutation } from "@/redux/services/onboarding/onboardingApi";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitAnswer] = useSubmitAnswerMutation();

  const currentData = onboardingData[step];

  const handleNext = async () => {
    // Validation: must select an option
    if (selected === null) {
      toast.error("Please select an option first!");
      return;
    }

    const session_id = Cookies.get("token");
    if (!session_id) {
      toast.error("Session not found!");
      return;
    }

    try {
      // Send answer to backend
      await submitAnswer({
        session_id,
        question: currentData.question,
        answer: currentData.options[selected],
      }).unwrap();

      // Move to next step or finish
      if (step < onboardingData.length - 1) {
        setStep(step + 1);
        setSelected(null);
      } else {
        toast.success("🎉 All questions completed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit answer. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 5,
        overflow: "hidden",
        background: `
          radial-gradient(circle at 20% 20%, #FFB3D1 0%, rgba(255, 255, 255, 0) 60%),
          linear-gradient(180deg, #BFDCFE 30.9%, #EBF3FD 100%)
        `,
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />
      <Container
        disableGutters
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "90%",
            maxWidth: "100%",
            height: "560px",
            borderRadius: "20px",
            gap: 2,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
            background: `
              radial-gradient(60.56% 24.66% at 12.44% 32.53%, #E5F1FF 0%, rgba(229, 241, 255, 0) 100%),
              radial-gradient(123% 84.66% at 92.11% 74.54%, #F8F0F8 0%, rgba(255, 255, 255, 0) 100%),
              radial-gradient(98.89% 49.35% at 96.78% 1.24%, #EAF3FF 0%, rgba(255, 255, 255, 0) 100%)
            `,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Logo */}
          <Image
            src={Logo}
            alt="CAMMI Logo"
            width={100}
            height={70}
            style={{
              objectFit: "contain",
              marginBottom: 12,
              marginTop: "30px",
            }}
          />

          {/* Question */}
          <Typography
            align="center"
            sx={{ fontSize: "26px", fontWeight: 700, mb: 1 }}
          >
            {currentData.question}
          </Typography>

          {/* Options */}
          <Box sx={{ flexGrow: 1, mb: 3, width: "100%" }}>
            <Box
              display="grid"
              gridTemplateColumns="repeat(3, 1fr)"
              rowGap={6}
              justifyItems="center"
              sx={{ py: 0, px: 15 }}
              height={"220px"}
            >
              {currentData.options.map((title, idx) => {
                const isActive = selected === idx;

                return (
                  <Card
                    key={idx}
                    onClick={() =>
                      setSelected((prev) => (prev === idx ? null : idx))
                    }
                    sx={{
                      width: "85%",
                      height: 100,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all .3s ease",
                      background: "#fff",
                      border: "2px solid #D9D9D9",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        border: "2px solid transparent",
                        background: `
                          linear-gradient(#fff, #fff) padding-box,
                          linear-gradient(to right, #FF3C80, #3EA2FF) border-box
                        `,
                        borderRadius: "12px",
                        boxShadow: `
                          inset 25px 0 50px -20px rgba(255, 60, 128, 0.4),
                          inset -25px 0 50px -20px rgba(62, 162, 255, 0.4)
                        `,
                      },
                      ...(isActive && {
                        transform: "translateY(-6px)",
                        border: "2px solid transparent",
                        background: `
                          linear-gradient(#fff, #fff) padding-box,
                          linear-gradient(to right, #FF3C80, #3EA2FF) border-box
                        `,
                        borderRadius: "12px",
                        boxShadow: `
                          inset 30px 0 60px -18px rgba(255, 60, 128, 0.5),
                          inset -30px 0 60px -18px rgba(62, 162, 255, 0.5)
                        `,
                      }),
                    }}
                    elevation={0}
                  >
                    <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                      {title}
                    </Typography>
                  </Card>
                );
              })}
            </Box>
          </Box>

          {/* Next button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleNext}
            sx={{
              borderRadius: "999px",
              px: 20,
              fontSize: "1.1rem",
              fontWeight: "bold",
            }}
          >
            {step < onboardingData.length - 1 ? "Next" : "Finish"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
