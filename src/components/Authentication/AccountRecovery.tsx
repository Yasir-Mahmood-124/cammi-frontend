"use client";
import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { UpperWave, LowerWave } from "@/assests/icons";
import Image from "next/image";
import Logo from "@/assests/images/Logo.png";
import { toast } from "@/utils/toast";
import { useForgotPasswordMutation } from "@/redux/services/auth/authApi";
import { useResetPasswordMutation } from "@/redux/services/auth/authApi";
import { useVerifyEmailMutation } from "@/redux/services/auth/authApi";
import { useVerifyCodeMutation } from "@/redux/services/auth/authApi";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const AccountRecovery = () => {
  const [step, setStep] = useState<
    "emailEntry" | "recovery" | "emailVerify" | "resetPassword"
  >("emailEntry");

  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotPassword] = useForgotPasswordMutation();
  const [resetPasswordApi] = useResetPasswordMutation();
  const [verifyEmailApi] = useVerifyEmailMutation();
  const [verifyCode] = useVerifyCodeMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const length = 6;
  const [codes, setCodes] = useState(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]*$/.test(value)) {
      if (value.length > 1) {
        const valArr = value.slice(0, length).split("");
        setCodes((prev) => {
          const newCodes = [...prev];
          for (let i = 0; i < length; i++) {
            newCodes[i] = valArr[i] || "";
          }
          return newCodes;
        });
        const nextIndex = Math.min(valArr.length, length - 1);
        inputsRef.current[nextIndex]?.focus();
      } else {
        const newCodes = [...codes];
        newCodes[index] = value;
        setCodes(newCodes);
        if (value && index < length - 1) {
          inputsRef.current[index + 1]?.focus();
        }
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
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

    const pasteArr = pasteData.slice(0, length).split("");
    const newCodes = [...codes];

    for (let i = 0; i < length; i++) {
      newCodes[i] = pasteArr[i] || "";
    }

    setCodes(newCodes);

    const lastIndex = Math.min(pasteArr.length - 1, length - 1);
    inputsRef.current[lastIndex]?.focus();
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "emailEntry") {
      if (!email) {
        toast(" Please enter your email", { variant: "warning" });
        return;
      }
      try {
        const res = await forgotPassword({ email }).unwrap();
        toast(res.message || " Code sent to your email!", {
          variant: "success",
        });
        setStep("recovery");
      } catch (err: any) {
        toast(err?.data?.message || " Failed to send code", {
          variant: "error",
        });
      }
    }
    if (step === "recovery") {
      const code = codes.join("");
      if (code.length < 6) {
        toast(" Please enter the full 6-digit code", { variant: "warning" });
        return;
      }
      try {
        const res = await verifyCode({ email, code }).unwrap();
        toast(res.message || "Recovery code verified!", {
          variant: "success",
        });
        setStep("resetPassword");
      } catch (err: any) {
        toast(err?.data?.message || " Invalid code", { variant: "error" });
      }
    }

    if (step === "resetPassword") {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!newPassword || !confirmPassword) {
        toast(" Please fill in all password fields", { variant: "warning" });
        return;
      }

      if (!passwordRegex.test(newPassword)) {
        toast(
          "Password must be at least 8 characters and include 1 uppercase, 1 number, and 1 special character.",
          {
            variant: "warning",
          }
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        toast(" Passwords do not match", { variant: "warning" });
        return;
      }

      try {
        const code = codes.join("");
        const res = await resetPasswordApi({
          email,
          code,
          newPassword,
          confirmPassword: confirmPassword,
        }).unwrap();

        toast(res.message || " Password reset successfully!", {
          variant: "success",
        });
        router.push("/sign-in");
      } catch (err: any) {
        toast(err?.data?.message || " Failed to reset password", {
          variant: "error",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#E5F1FF",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 0,
        }}
      >
        <UpperWave color="#F8F0F8" style={{ height: "200px" }} />
      </Box>

      <Container
        maxWidth={false}
        disableGutters
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            mt: 2,
          }}
        >
          <Image
            src={Logo}
            alt="CAMMI Logo"
            width={110}
            height={70}
            style={{ objectFit: "contain" }}
          />
        </Box>

        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          gap={4}
          mt={"120px"}
          ml={20}
        >
          <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
            <Typography variant="h1" sx={{ color: "#000", lineHeight: 1.2 }}>
              CAMMI:&nbsp;
              <Box component="span" sx={{ color: "secondary.main" }}>
                Your AI-Powered
              </Box>
            </Typography>
            <Typography
              variant="h1"
              sx={{ color: "#000", mt: 0.5, ml: "42px" }}
            >
              Marketing BFF
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 25,
            flexWrap: "wrap",
            ml: "200px",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: 250,
              height: 250,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Dummy Feature Card
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              width: 360,
              borderRadius: 4,
              px: 4,
              py: 5,
              ml: "185px",
              mt: "-80px",
              backgroundColor: "#fff",
              backgroundImage: `
      radial-gradient(60% 30% at 12% 38%, #E5F1FF 0%, rgba(229,241,255,0) 100%),
      radial-gradient(120% 100% at 92% 88%, #F8F0F8 0%, rgba(248,240,248,0) 100%),
      radial-gradient(100% 60% at 97% 2%, #EAF3FF 0%, rgba(234,243,255,0) 100%)
    `,
              boxShadow: "0px 8px 15px 2px #00000026",
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Step Headings */}
              {step === "emailEntry" && (
                <>
                  <Typography variant="h1" textAlign="center" sx={{ mb: 2 }}>
                    Forgot Password
                  </Typography>

                  <TextField
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    fullWidth
                    sx={{ mb: 3 }}
                  />
                </>
              )}

              {(step === "recovery" || step === "emailVerify") && (
                <>
                  <Typography
                    variant="h1"
                    textAlign="center"
                    sx={{ mb: 2, mt: -3 }}
                  >
                    {step === "recovery"
                      ? "Account Recovery"
                      : "Email Verification"}
                  </Typography>
                  <Typography
                    variant="h6"
                    textAlign="center"
                    sx={{ mb: 3, color: "#838485" }}
                  >
                    {step === "recovery"
                      ? "Enter the 6-digit code sent to your email"
                      : "Enter the 6-digit code we emailed you"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    mb={3}
                  >
                    {codes.map((digit, index) => (
                      <TextField
                        key={index}
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          handleKeyDown(e, index)
                        }
                        onPaste={(e: React.ClipboardEvent<HTMLInputElement>) =>
                          handlePaste(e, index)
                        }
                        inputRef={(el) => (inputsRef.current[index] = el)}
                        inputProps={{
                          maxLength: 1,
                          style: { textAlign: "center", fontSize: "20px" },
                        }}
                        sx={{
                          width: 45,
                          "& .MuiInputBase-root": {
                            height: 55,
                            borderRadius: 2,
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </>
              )}

              {step === "resetPassword" && (
                <>
                  <Typography
                    variant="h1"
                    textAlign="center"
                    sx={{ mb: 2, mt: -3 }}
                  >
                    New Password
                  </Typography>
                  <Stack spacing={2}>
                    <Typography
                      variant="h6"
                      sx={{ color: "#000", fontWeight: "bold" }}
                    >
                      New Password
                    </Typography>
                    <TextField
                      fullWidth
                      // type="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": { height: 45 },
                        "& input": { padding: "15px 8px", fontSize: "14px" },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ color: "#000", fontWeight: "bold" }}
                    >
                      Confirm Password
                    </Typography>
                    <TextField
                      fullWidth
                      // type="password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      size="small"
                      sx={{
                        "& .MuiInputBase-root": { height: 45 },
                        "& input": { padding: "15px 8px", fontSize: "14px" },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                              }
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                type="submit"
                sx={{ mt: 2, borderRadius: "30px" }}
              >
                {step === "emailEntry"
                  ? "Send Code 6 Digit Code"
                  : step === "resetPassword"
                  ? "Change Password"
                  : "Verify"}
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>

      {/* Bottom Wave */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 0,
        }}
      >
        <LowerWave color="#E5F1FF" style={{ height: "180px" }} />
      </Box>
    </Box>
  );
};

export default AccountRecovery;
