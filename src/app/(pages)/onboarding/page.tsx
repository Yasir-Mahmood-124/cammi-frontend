"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  Stack,
} from "@mui/material";
import Image from "next/image";
import Logo from "@/assests/images/Logo.png";
import { onboardingData } from "./data";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const currentData = onboardingData[step];

  const handleNext = () => {
    if (step < onboardingData.length - 1) {
      setStep(step + 1);
      setSelected(null);
    } else {
      console.log("🎉 All questions completed!");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        overflow: "hidden",
        background: `
          radial-gradient(circle at 20% 20%, #FFB3D1 0%, rgba(255, 255, 255, 0) 60%),
          linear-gradient(180deg, #BFDCFE 30.9%, #EBF3FD 100%)
        `,
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: "100%",
            height: "500px",
            borderRadius: "20px",
            p: 4,
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
            backgroundColor: "#FFFFFF", // fallback in case gradients fail
          }}
        >
          {/* Logo */}
          <Image
            src={Logo}
            alt="CAMMI Logo"
            width={100}
            height={50}
            style={{
              objectFit: "contain",
              marginBottom: 12,
              marginTop: "-12px",
            }}
          />

          {/* Question */}
          <Typography
            align="center"
            sx={{ fontSize: "26px", fontWeight: 700, mb: 3 }}
          >
            {currentData.question}
          </Typography>

          {/* Cards using Stack */}
          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={2}
            justifyContent="center"
            sx={{ width: "100%", mb: 3 }}
          >
            {currentData.options.map((title, idx) => {
              const isActive = selected === idx;

              return (
                <Box
                  key={idx}
                  sx={{
                    flex: "1 1 200px", // minimum width 200px, grow as needed
                    maxWidth: "250px", // optional max width
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Card
  onClick={() =>
    setSelected((prev) => (prev === idx ? null : idx))
  }
  sx={{
    width: 200,
    height: 100,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
    transition: "all .3s ease",
    background: "#fff", // default background
    border: "2px solid #D9D9D9", // default border
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
      border: "2px solid transparent",
      background: `
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(270deg, #3EA2FF 0%, #FF3C80 100%) border-box
      `,
      borderRadius: "12px",
    },
    ...(selected === idx && {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
      border: "2px solid transparent",
      background: `
        radial-gradient(53.71% 149.44% at 89.65% -24.61%, rgba(95,176,254,0.2) 0%, rgba(255,255,255,0) 100%),
        radial-gradient(49.41% 235.67% at -12.5% 110.55%, rgba(251,86,145,0.2) 0%, rgba(255,255,255,0) 100%),
        #FFFFFF padding-box,
        linear-gradient(270deg, #3EA2FF 0%, #FF3C80 100%) border-box
      `,
      borderRadius: "12px",
    }),
  }}
  elevation={0}
>
  <Typography sx={{ fontWeight: 500, px: 1, fontSize: 14 }}>
    {title}
  </Typography>
</Card>

                </Box>
              );
            })}
          </Stack>

          {/* Next button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleNext}
            sx={{ borderRadius: "10px", px: 6 }}
          >
            {step < onboardingData.length - 1 ? "Next" : "Finish"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
