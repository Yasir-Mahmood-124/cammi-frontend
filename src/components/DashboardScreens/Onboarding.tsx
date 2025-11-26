"use client";
import React, { useState } from "react";
import { Box, Container, Paper, Typography, Button, Card } from "@mui/material";
import Image from "next/image";
import Logo from "@/assests/images/Logo.png";
import Background3 from "@/assests/images/Background3.png";
import { onboardingData } from "../../const/data";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { useSubmitAnswerMutation } from "@/redux/services/onboarding/onboardingApi";
import { useRouter } from "next/navigation";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitAnswer] = useSubmitAnswerMutation();
  const router = useRouter();
  const currentData = onboardingData[step];

  const handleNext = async () => {
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
      await submitAnswer({
        session_id,
        question: currentData.question,
        answer: currentData.options[selected],
      }).unwrap();

      if (step < onboardingData.length - 1) {
        setStep(step + 1);
        setSelected(null);
      } else {
        toast.success(" All questions completed!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to submit answer. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#EFF1F5", // Base background color from Figma
        backgroundImage: `url(${Background3.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: "none",
        },
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      <Container
        disableGutters
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: "950px",
            minHeight: "auto",
            borderRadius: "20px",
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Image
            src={Logo}
            alt="CAMMI Logo"
            width={90}
            height={60}
            style={{
              objectFit: "contain",
              marginBottom: 8,
            }}
          />

          <Typography
            align="center"
            sx={{
              fontSize: {
                xs: "18px",
                sm: "20px",
                md: "22px",
                lg: "24px",
                xl: "30px",
              },
              fontWeight: 700,
              mb: 3,
              mt: 1,
            }}
          >
            {currentData.question}
          </Typography>

          <Box sx={{ width: "100%", mb: 3 }}>
            {currentData.options.length === 7 ? (
              // Special layout for 7 options: 4 in first row, 3 in second row
              <Box sx={{ px: { xs: 2, sm: 4, md: 8 } }}>
                {/* First row: 4 cards */}
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(4, 1fr)"
                  gap={2.5}
                  sx={{ mb: 2.5 }}
                >
                  {currentData.options.slice(0, 4).map((title, idx) => {
                    const isActive = selected === idx;

                    return (
                      <Card
                        key={idx}
                        onClick={() =>
                          setSelected((prev) => (prev === idx ? null : idx))
                        }
                        sx={{
                          width: "100%",
                          height: "90px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all .3s ease",
                          background: "#fff",
                          border: "2px solid #D9D9D9",
                          px: 1.5,

                          "&:hover": {
                            border: "2px solid transparent",
                            background: `
        radial-gradient(circle at 0% 50%, rgba(255, 60, 128, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 100% 50%, rgba(62, 162, 255, 0.15) 0%, transparent 50%),
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #FF3C80 0%, #3EA2FF 100%) border-box
      `,
                            borderRadius: "12px",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                          },

                          ...(isActive && {
                            border: "2px solid transparent",
                            background: `
        radial-gradient(circle at 0% 50%, rgba(255, 60, 128, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 100% 50%, rgba(62, 162, 255, 0.2) 0%, transparent 50%),
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #FF3C80 0%, #3EA2FF 100%) border-box
      `,
                            borderRadius: "12px",
                            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                          }),
                        }}
                        elevation={0}
                      >
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: 12, sm: 13, md: 14 },
                          }}
                        >
                          {title}
                        </Typography>
                      </Card>
                    );
                  })}
                </Box>

                {/* Second row: 3 cards centered */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2.5,
                  }}
                >
                  {currentData.options.slice(4, 7).map((title, idx) => {
                    const actualIdx = idx + 4;
                    const isActive = selected === actualIdx;

                    return (
                      <Card
                        key={actualIdx}
                        onClick={() =>
                          setSelected((prev) =>
                            prev === actualIdx ? null : actualIdx
                          )
                        }
                        sx={{
                          width: "100%",
                          maxWidth: "calc(33.333% - 13.33px)",
                          height: "90px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all .3s ease",
                          background: "#fff",
                          border: "2px solid #D9D9D9",
                          px: 1.5,

                          "&:hover": {
                            border: "2px solid transparent",
                            background: `
        radial-gradient(circle at 0% 50%, rgba(255, 60, 128, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 100% 50%, rgba(62, 162, 255, 0.15) 0%, transparent 50%),
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #FF3C80 0%, #3EA2FF 100%) border-box
      `,
                            borderRadius: "12px",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                          },

                          ...(isActive && {
                            border: "2px solid transparent",
                            background: `
        radial-gradient(circle at 0% 50%, rgba(255, 60, 128, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 100% 50%, rgba(62, 162, 255, 0.2) 0%, transparent 50%),
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #FF3C80 0%, #3EA2FF 100%) border-box
      `,
                            borderRadius: "12px",
                            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                          }),
                        }}
                        elevation={0}
                      >
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: 12, sm: 13, md: 14 },
                          }}
                        >
                          {title}
                        </Typography>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              // Standard grid layout for other option counts
              <Box
                display="grid"
                gridTemplateColumns={
                  currentData.options.length === 3
                    ? "repeat(2, 1fr)"
                    : currentData.options.length === 4
                    ? "repeat(2, 1fr)"
                    : currentData.options.length === 6
                    ? "repeat(3, 1fr)"
                    : "repeat(3, 1fr)"
                }
                gap={2.5}
                sx={{ px: { xs: 2, sm: 4, md: 8 } }}
              >
                {currentData.options.map((title, idx) => {
                  const isActive = selected === idx;
                  const totalOptions = currentData.options.length;

                  // Determine if this card should span full width (for centered last cards)
                  const shouldCenterLast = totalOptions === 3 && idx === 2;

                  return (
                    <Card
                      key={idx}
                      onClick={() =>
                        setSelected((prev) => (prev === idx ? null : idx))
                      }
                      sx={{
                        width: "100%",
                        height: "90px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all .3s ease",
                        background: "#fff",
                        border: "2px solid #D9D9D9",
                        px: 1.5,
                        ...(shouldCenterLast && {
                          gridColumn: "1 / -1",
                          maxWidth: "calc(50% - 10px)",
                          margin: "0 auto",
                        }),

                        "&:hover": {
                          border: "2px solid transparent",
                          background: `
        radial-gradient(circle at 0% 50%, rgba(255, 60, 128, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 100% 50%, rgba(62, 162, 255, 0.15) 0%, transparent 50%),
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #FF3C80 0%, #3EA2FF 100%) border-box
      `,
                          borderRadius: "12px",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        },

                        ...(isActive && {
                          border: "2px solid transparent",
                          background: `
        radial-gradient(circle at 0% 50%, rgba(255, 60, 128, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 100% 50%, rgba(62, 162, 255, 0.2) 0%, transparent 50%),
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #FF3C80 0%, #3EA2FF 100%) border-box
      `,
                          borderRadius: "12px",
                          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
                        }),
                      }}
                      elevation={0}
                    >
                      <Typography
                        sx={{
                          fontWeight: 500,
                          fontSize: { xs: 12, sm: 13, md: 14 },
                        }}
                      >
                        {title}
                      </Typography>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleNext}
            sx={{
              borderRadius: "999px",
              px: { xs: 8, sm: 12, md: 18 },
              py: 1.2,
              fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
              fontWeight: "bold",
              mb: 2,
              minWidth: "200px",
            }}
          >
            {step < onboardingData.length - 1 ? "Next" : "Finish"}
          </Button>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", gap: 0.8 }}>
              {onboardingData.map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: idx === step ? 24 : 18,
                    height: 3.5,
                    borderRadius: 2,
                    // Changed condition: idx <= step means current and all previous steps are filled
                    background:
                      idx <= step
                        ? "linear-gradient(to right, #F34288, #FF3C80)"
                        : "#D9D9D9",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              {step + 1} out of {onboardingData.length}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Onboarding;
