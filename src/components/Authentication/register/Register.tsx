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
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { UpperWave, LowerWave } from "@/assests/icons";
import { Google } from "@/assests/icons";
import Image from "next/image";
import Logo from "@/assests/images/Logo.png";
import { toast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/handleApiError";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  useRegisterMutation,
  useVerifyEmailMutation,
} from "@/redux/services/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { validatePassword } from "@/utils/validators";
import { useLazyGoogleLoginQuery } from "@/redux/services/auth/googleApi";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const [currentCard, setCurrentCard] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill("")
  );

  const [register, { isLoading }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const dispatch = useAppDispatch();
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [googleLogin] = useLazyGoogleLoginQuery();

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
  const handleClick = async () => {
    try {
      const res = await googleLogin().unwrap();

      if (res.login_url) {
        window.location.href = res.login_url;
      } else {
        console.error("No login_url in response", res);
      }
    } catch (err) {
      console.error("Error calling Google login endpoint", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast(passwordError, { variant: "warning" });
      return;
    }

    try {
      const result = await register(formData).unwrap();
      toast(" Registration successful!", { variant: "success" });

      setShowVerification(true);
    } catch (err) {
      console.error("❌ Registration failed:", err);
      toast(getErrorMessage(err), { variant: "error" });
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

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
      toast(" Please enter all 6 digits.", { variant: "warning" });
      return;
    }

    try {
      const result = await verifyEmail({
        email: formData.email,
        code,
      }).unwrap();

      console.log(" Email verified:", result);
      router.push("/sign-in");

      toast(" Email verified successfully!", { variant: "success" });
    } catch (err) {
      console.error(" Verification failed:", err);

      toast(getErrorMessage(err), { variant: "error" });
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").replace(/\D/g, "");
    if (!pasteData) return;

    const pasteArr = pasteData.slice(0, verificationCode.length).split("");
    const newCodes = [...verificationCode];

    for (let i = 0; i < verificationCode.length; i++) {
      newCodes[i] = pasteArr[i] || "";
    }

    setVerificationCode(newCodes);

    const lastIndex = Math.min(
      pasteArr.length - 1,
      verificationCode.length - 1
    );
    inputsRef.current[lastIndex]?.focus();
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
      <Box
        sx={{
          position: "absolute",
          width: "120vw",
          height: "30vh",
          top: "-5vh",
          left: "-10vw",
          zIndex: 0,
        }}
      >
        <UpperWave width="100%" height="100%" />
      </Box>

      <Box
        sx={{
          position: "absolute",
          width: "120vw",
          height: "30vh",
          bottom: "-5vh",
          left: "-10vw",
          zIndex: 0,
        }}
      >
        <LowerWave width="100%" height="100%" />
      </Box>

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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "50vw",
          }}
        >
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
                    translateX(${
                      index === currentCard ? 0 : (index - currentCard) * 12
                    }px)
                    translateY(${
                      index === currentCard ? 0 : (index - currentCard) * 12
                    }px)
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

        {showVerification ? (
          <Paper
            elevation={0}
            sx={{
              width: 360,
              borderRadius: 4,
              px: 4,
              py: 5,
              ml: "185px",
              mt: "-10px",
              backgroundColor: "#fff",
              backgroundImage: `
      radial-gradient(60% 30% at 12% 38%, #E5F1FF 0%, rgba(229,241,255,0) 100%),
      radial-gradient(120% 100% at 92% 88%, #F8F0F8 0%, rgba(248,240,248,0) 100%),
      radial-gradient(100% 60% at 97% 2%, #EAF3FF 0%, rgba(234,243,255,0) 100%)
    `,
              boxShadow: "0px 8px 15px 2px #00000026",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                mb: 3,
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

            <Stack direction="row" spacing={1} justifyContent="center" mb={3}>
              {verificationCode.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputsRef.current[idx] = el;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={(e) => handlePaste(e, idx)}
                  maxLength={1}
                  style={{
                    width: "48px",
                    height: "58px",
                    fontSize: "20px",
                    textAlign: "center",
                    border: "1.5px solid #D0D5DD",
                    borderRadius: "12px",
                    outline: "none",
                    background: "#F9FAFB",
                    fontWeight: 600,
                    color: "#344054",
                    transition: "0.2s all ease-in-out",
                  }}
                />
              ))}
            </Stack>
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
          <Paper
            sx={{
              width: "31vw",
              maxWidth: "400px",
              minHeight: "60vh",
              borderRadius: "24px",
              backgroundColor: "#fff",
              backgroundImage: `
            radial-gradient(60% 30% at 12% 38%, #E5F1FF 0%, rgba(229,241,255,0) 100%),
            radial-gradient(120% 100% at 92% 88%, #F8F0F8 0%, rgba(248,240,248,0) 100%),
            radial-gradient(100% 60% at 97% 2%, #EAF3FF 0%, rgba(234,243,255,0) 100%)
          `,
              boxShadow: "0px 8px 15px rgba(0,0,0,0.15)",
              padding: "32px",
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
              <Link href="/sign-in" passHref>
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
              </Link>
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
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
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
                  onClick={handleClick}
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
                ></Button>
              </Stack>
            </form>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Register;
