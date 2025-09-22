"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { Google } from "../../../../assests/icons";
import Image from "next/image";
import Logo from "../../../../assests/images/Logo.png";

// RTK Query + Redux
import {
  useRegisterMutation,
  useVerifyEmailMutation,
} from "@/redux/services/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/services/auth/authSlice";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [currentCard, setCurrentCard] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill("")
  );

  // RTK Query hooks
  const [register, { isLoading }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const dispatch = useAppDispatch();

  // Animation for cards (left side)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register(formData).unwrap();
      console.log("✅ Registration successful:", result);

      // Show email verification card
      setShowVerification(true);
    } catch (err) {
      console.error("❌ Registration failed:", err);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(
          `code-${index + 1}`
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      alert("Please enter all 6 digits.");
      return;
    }

    try {
      const result = await verifyEmail({
        email: formData.email,
        code,
      }).unwrap();

      console.log("✅ Email verified:", result);

      alert("🎉 Email verified successfully!");
    } catch (err) {
      console.error("❌ Verification failed:", err);
      alert("Verification failed. Please check your code.");
    }
  };

  const cardContents = [
    {
      title: "Marketing Dashboard",
      content:
        "Track your campaigns performance with real-time analytics and insights.",
      color: "#FF3C80",
    },
    {
      title: "AI-Powered Insights",
      content:
        "Get intelligent recommendations to optimize your marketing strategy.",
      color: "#3EA2FF",
    },
    {
      title: "Campaign Management",
      content:
        "Manage all your marketing campaigns from one centralized platform.",
      color: "#9C27B0",
    },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#EFF1F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Top Wave */}
      <Box
        sx={{
          position: "absolute",
          width: "120vw",
          height: "30vh",
          top: "-5vh",
          left: "-10vw",
          background: `
            linear-gradient(135deg, #C8E1F5 0%, #B3D4F1 30%, #A8CEF0 60%, #9FC8EE 100%)
          `,
          borderRadius: "0 0 50% 50%",
          zIndex: 0,
        }}
      />

      {/* Bottom Wave */}
      <Box
        sx={{
          position: "absolute",
          width: "120vw",
          height: "30vh",
          bottom: "-5vh",
          left: "-10vw",
          background: `
            linear-gradient(135deg, #C8E1F5 0%, #B3D4F1 30%, #A8CEF0 60%, #9FC8EE 100%)
          `,
          borderRadius: "50% 50% 0 0",
          zIndex: 0,
        }}
      />

      {/* Logo */}
      <Box
        sx={{
          position: "absolute",
          top: "4vh",
          left: "4vw",
          zIndex: 10,
        }}
      >
        <Image
          src={Logo}
          alt="CAMMI Logo"
          width={100}
          height={60}
          style={{ objectFit: "contain" }}
        />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 4vw",
          zIndex: 5,
        }}
      >
        {/* Left Side - Cards */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "50vw",
          }}
        >
          {/* Heading Text */}
          <Box sx={{ mb: 10, ml: 3 }}>
            <Typography
              variant="h1"
              sx={{
                mb: 1,
                fontSize: "36px",
                fontWeight: 500,
                lineHeight: "44px",
                letterSpacing: "-0.02em",
                color: "#344054",
              }}
            >
              CAMMI: Your{" "}
              <Box component="span" sx={{ color: "#FF3C80" }}>
                AI-Powered
              </Box>
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: "36px",
                fontWeight: 500,
                lineHeight: "44px",
                letterSpacing: "-0.02em",
                color: "#344054",
              }}
            >
              Marketing BFF
            </Typography>
          </Box>

          {/* Animated Cards */}
          <Box
            sx={{
              position: "relative",
              width: "26vw",
              height: "20vh",
            }}
          >
            {cardContents.map((card, index) => (
              <Paper
                key={index}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "16px",
                  padding: "20px",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.12)",
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: `
                    translateX(${index === currentCard ? 0 : (index - currentCard) * 12}px)
                    translateY(${index === currentCard ? 0 : (index - currentCard) * 12}px)
                    scale(${index === currentCard ? 1 : 0.96})
                  `,
                  zIndex:
                    index === currentCard
                      ? 10
                      : 10 - Math.abs(index - currentCard),
                  opacity: index === currentCard ? 1 : 0.8,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    color: card.color,
                    mb: 1,
                    fontSize: "18px",
                    fontWeight: 500,
                    lineHeight: "24px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "14px",
                    mb: 2,
                    fontWeight: 500,
                    lineHeight: "22px",
                    color: "#344054",
                  }}
                >
                  {card.content}
                </Typography>

                {/* Mock chart */}
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "end" }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        width: "12px",
                        height: `${12 + item * 6}px`,
                        background: `linear-gradient(to top, ${card.color}40, ${card.color})`,
                        borderRadius: "2px",
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Right Side - Conditional Card */}
        {showVerification ? (
          // Email Verification Card
          <Paper
            sx={{
              width: 450,
              height: 325,
              borderRadius: "24px",
              padding: "32px",
              background: "#fff",
              boxShadow: "0px 8px 15px 2px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                mb: 1,
                color: "#344054",
                fontSize: "36px",
              }}
            >
              Email Verification
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: "#667085",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              Enter Code
            </Typography>

            {/* Code Inputs */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
              {verificationCode.map((digit, idx) => (
                <TextField
                  key={idx}
                  id={`code-${idx}`}
                  value={digit}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: "center", fontSize: "18px" },
                  }}
                  sx={{ width: "35px", height: "45px" }}
                />
              ))}
            </Box>

            {/* Verify Button */}
            <Button
              variant="contained"
              onClick={handleVerify}
              disabled={isVerifying}
              sx={{ py: 1, px: 4, borderRadius: "10px" }}
              fullWidth
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </Paper>
        ) : (
          // Signup Form
          <Paper
            sx={{
              width: "31vw",
              maxWidth: "400px",
              minHeight: "60vh",
              borderRadius: "24px",
              background: "#fff",
              boxShadow: "0px 8px 15px 2px rgba(0, 0, 0, 0.15)",
              padding: "32px",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                textAlign: "center",
                mb: 1,
                fontSize: "36px",
                fontWeight: 500,
                color: "#000000",
                marginBottom: "16px",
              }}
            >
              Signup
            </Typography>

            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                mb: 3,
                fontSize: "18px",
                fontWeight: 500,
                color: "#838485",
              }}
            >
              Already have an account?{" "}
              <Box
                component="span"
                sx={{
                  color: "#FF3C80",
                  cursor: "pointer",
                  textDecoration: "underline",
                  "&:hover": { color: "#FF3C80" },
                }}
              >
                Login
              </Box>
            </Typography>

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{ mb: 0.5, fontSize: "16px", fontWeight: 500 }}
                    >
                      First name
                    </Typography>
                    <TextField
                      fullWidth
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      size="small"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{ mb: 0.5, fontSize: "16px", fontWeight: 500 }}
                    >
                      Last name
                    </Typography>
                    <TextField
                      fullWidth
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      size="small"
                    />
                  </Box>
                </Stack>

                <Box>
                  <Typography
                    sx={{ mb: 0.5, fontSize: "16px", fontWeight: 500 }}
                  >
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{ mb: 0.5, fontSize: "16px", fontWeight: 500 }}
                  >
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    size="small"
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: "10px",
                    fontSize: "16px",
                  }}
                >
                  {isLoading ? "Signing up..." : "Sign up"}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Google />}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: "10px",
                    border: "1px solid #D0D5DD",
                    background: "rgba(255, 255, 255, 0.9)",
                    textTransform: "none",
                  }}
                >
                  Continue with Google
                </Button>
              </Stack>
            </form>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default RegisterPage;
