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

  // Extract common card styles
  const getCardStyles = (isActive: boolean) => ({
    width: "100%",
    height: { xs: "57px", sm: "61px", md: "65px", lg: "69px" },
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
    transition: "all .3s ease",
    background: "#fff",
    border: {
      xs: "1px solid #D9D9D9",
      sm: "1px solid #D9D9D9",
      md: "1.5px solid #D9D9D9",
      lg: "1.8px solid #D9D9D9",
      xl: "1.8px solid #D9D9D9",
    },
    px: { xs: 1, sm: 1.5 },

    "&:hover": {
      border: "1.8px solid transparent",
      background: `
        radial-gradient(circle at 0% 50%, rgba(255, 60, 128, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 100% 50%, rgba(62, 162, 255, 0.15) 0%, transparent 50%),
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #FF3C80 0%, #3EA2FF 100%) border-box
      `,
      borderRadius: "11px",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    },

    ...(isActive && {
      border: "1.8px solid transparent",
      background: `
        radial-gradient(circle at 0% 50%, rgba(255, 60, 128, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 100% 50%, rgba(62, 162, 255, 0.2) 0%, transparent 50%),
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(90deg, #FF3C80 0%, #3EA2FF 100%) border-box
      `,
      borderRadius: "11px",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
    }),
  });

  // Reusable OptionCard component
  const OptionCard = ({
    title,
    idx,
    additionalStyles = {},
  }: {
    title: string;
    idx: number;
    additionalStyles?: object;
  }) => {
    const isActive = selected === idx;

    return (
      <Card
        onClick={() => setSelected((prev) => (prev === idx ? null : idx))}
        sx={{
          ...getCardStyles(isActive),
          ...additionalStyles,
        }}
        elevation={0}
      >
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: { xs: 9.5, sm: 10.4, md: 11.3, lg: 11.7 },
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
      </Card>
    );
  };

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
        p: { xs: 2, sm: 2.5 },
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#EFF1F5",
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
            maxWidth: { xs: "95%", sm: "85%", md: "720px", lg: "790px" },
            minHeight: "auto",
            borderRadius: { xs: "18px", sm: "20px", md: "22px" },
            p: { xs: 2.2, sm: 2.7, md: 3.2 },
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
            height={54}
            style={{
              objectFit: "contain",
            }}
          />

          <Typography
            align="center"
            sx={{
              fontSize: {
                xs: "13.5px",
                sm: "15.3px",
                md: "17.1px",
                lg: "18.9px",
                xl: "24.3px",
              },
              fontWeight: 700,
              mb: { xs: 3.2, sm: 3.6, md: 4, lg: 5.4, xl: 6.3 },
              mt: { xs: 1.4, sm: 1.8, md: 2.2, lg: 4.5, xl: 5.4 },
              px: { xs: 1, sm: 2 },
            }}
          >
            {currentData.question}
          </Typography>

          <Box sx={{ width: "100%", mb: { xs: 1.8, sm: 2.2, md: 2.2, lg: 2.7 } }}>
            {currentData.options.length === 7 ? (
              // Special layout for 7 options: 4 in first row, 3 in second row
              <Box sx={{ px: { xs: 2, sm: 3, md: 4.5, lg: 6.3 } }}>
                {/* First row: 4 cards */}
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(4, 1fr)",
                  }}
                  gap={{ xs: 1.2, sm: 1.45, md: 1.62 }}
                  sx={{ mb: { xs: 1.2, sm: 1.45, md: 2.7, lg: 4.5 } }}
                >
                  {currentData.options.slice(0, 4).map((title, idx) => (
                    <OptionCard key={idx} title={title} idx={idx} />
                  ))}
                </Box>

                {/* Second row: 3 cards */}
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                  }}
                  gap={{ xs: 1.2, sm: 1.45, md: 1.62 }}
                  sx={{
                    maxWidth: { sm: "75%", md: "75%" },
                    mx: { sm: "auto" },
                  }}
                >
                  {currentData.options.slice(4, 7).map((title, idx) => (
                    <OptionCard
                      key={idx + 4}
                      title={title}
                      idx={idx + 4}
                      additionalStyles={{
                        gridColumn: {
                          xs: idx === 2 ? "1 / -1" : "auto",
                          sm: "auto",
                        },
                        maxWidth: {
                          xs: idx === 2 ? "calc(50% - 6px)" : "100%",
                          sm: "100%",
                        },
                        mx: {
                          xs: idx === 2 ? "auto" : 0,
                          sm: 0,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              // Standard grid layout for other option counts (3, 4, 6)
              <Box sx={{ px: { xs: 2, sm: 3, md: 4.5, lg: 6.3 } }}>
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    xs:
                      currentData.options.length === 3 ||
                      currentData.options.length === 4
                        ? "repeat(1, 1fr)"
                        : "repeat(2, 1fr)",
                    sm:
                      currentData.options.length === 3 ||
                      currentData.options.length === 4
                        ? "repeat(2, 1fr)"
                        : currentData.options.length === 6
                        ? "repeat(3, 1fr)"
                        : "repeat(3, 1fr)",
                  }}
                  gap={{ xs: 1.2, sm: 1.45, md: 1.62 }}
                  rowGap={{ xs: 1.8, sm: 2.2, md: 2.7, lg: 4.5 }}
                  sx={{
                    maxWidth:
                      currentData.options.length === 3 ||
                      currentData.options.length === 4
                        ? { sm: "66.67%", md: "66.67%" }
                        : "100%",
                    mx:
                      currentData.options.length === 3 ||
                      currentData.options.length === 4
                        ? { sm: "auto" }
                        : 0,
                  }}
                >
                  {currentData.options.map((title, idx) => {
                    const shouldCenterLast =
                      currentData.options.length === 3 && idx === 2;

                    return (
                      <OptionCard
                        key={idx}
                        title={title}
                        idx={idx}
                        additionalStyles={
                          shouldCenterLast
                            ? {
                                gridColumn: { xs: "auto", sm: "1 / -1" },
                                maxWidth: {
                                  xs: "100%",
                                  sm: "calc(50% - 10px)",
                                },
                                margin: { xs: 0, sm: "0 auto" },
                              }
                            : {}
                        }
                      />
                    );
                  })}
                </Box>
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
              px: { xs: 4.5, sm: 6.3, md: 9, lg: 13.5 },
              py: { xs: 0.8, sm: 0.9, md: 1 },
              fontSize: {
                xs: "0.77rem",
                sm: "0.81rem",
                md: "0.86rem",
                lg: "0.9rem",
              },
              fontWeight: "bold",
              mb: { xs: 1.4, sm: 1.6, md: 1.8, lg: 4.5, xl: 5.4 },
              mt: { xs: 1.8, sm: 2, md: 2.2, lg: 3.6, xl: 4.5 },
              minWidth: { xs: "135px", sm: "153px", md: "162px" },
            }}
          >
            {step < onboardingData.length - 1 ? "Next" : "Finish"}
          </Button>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.7,
            }}
          >
            <Box sx={{ display: "flex", gap: { xs: 0.45, sm: 0.54, md: 0.63 } }}>
              {onboardingData.map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: {
                      xs: idx === step ? 16 : 12,
                      sm: idx === step ? 18 : 13.5,
                      md: idx === step ? 20 : 14.5,
                    },
                    height: { xs: 2.5, sm: 2.7, md: 2.9 },
                    borderRadius: 2,
                    background:
                      idx <= step
                        ? "linear-gradient(to right, #F34288, #FF3C80)"
                        : "#D9D9D9",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Box>

            <Typography
              sx={{
                fontSize: { xs: 10.4, sm: 10.8, md: 11.3 },
                fontWeight: 500,
              }}
            >
              {step + 1} out of {onboardingData.length}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Onboarding;