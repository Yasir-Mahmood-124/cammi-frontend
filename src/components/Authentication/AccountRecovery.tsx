"use client";
import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { toast } from "@/utils/toast";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyCodeMutation,
} from "@/redux/services/auth/authApi";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const AccountRecovery = () => {
  const [step, setStep] = useState<"emailEntry" | "recovery" | "resetPassword">(
    "emailEntry"
  );
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotPassword] = useForgotPasswordMutation();
  const [resetPasswordApi] = useResetPasswordMutation();
  const [verifyCode] = useVerifyCodeMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const length = 6;
  const [codes, setCodes] = useState(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]*$/.test(value)) {
      const newCodes = [...codes];
      newCodes[index] = value.slice(-1);
      setCodes(newCodes);
      if (value && index < length - 1) inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").replace(/\D/g, "");
    if (!pasteData) return;
    const pasteArr = pasteData.slice(0, length).split("");
    setCodes(pasteArr);
    inputsRef.current[Math.min(pasteArr.length - 1, length - 1)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "emailEntry") {
      if (!email) {
        toast("Please enter your email", { variant: "warning" });
        return;
      }
      try {
        const res = await forgotPassword({ email }).unwrap();
        toast(res.message || "Code sent to your email!", {
          variant: "success",
        });
        setStep("recovery");
      } catch (err: any) {
        toast(err?.data?.message || "Failed to send code", {
          variant: "error",
        });
      }
    }

    if (step === "recovery") {
      const code = codes.join("");
      if (code.length < 6) {
        toast("Please enter the full 6-digit code", { variant: "warning" });
        return;
      }
      try {
        const res = await verifyCode({ email, code }).unwrap();
        toast(res.message || "Recovery code verified!", { variant: "success" });
        setStep("resetPassword");
      } catch (err: any) {
        toast(err?.data?.message || "Invalid code", { variant: "error" });
      }
    }

    if (step === "resetPassword") {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      const code = codes.join("");

      if (!newPassword || !confirmPassword) {
        toast("Please fill in all password fields", { variant: "warning" });
        return;
      }

      if (!passwordRegex.test(newPassword)) {
        toast(
          "Password must be at least 8 chars, include uppercase, number, and symbol.",
          {
            variant: "warning",
          }
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        toast("Passwords do not match", { variant: "warning" });
        return;
      }

      try {
        const res = await resetPasswordApi({
          email,
          code,
          newPassword,
          confirmPassword,
        }).unwrap();
        toast(res.message || "Password reset successfully!", {
          variant: "success",
        });
        router.push("/sign-in");
      } catch (err: any) {
        toast(err?.data?.message || "Failed to reset password", {
          variant: "error",
        });
      }
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#EFF1F5",
        zIndex: 0,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/Background/Background.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
          zIndex: -2,
        },
        // "&::after": {
        //   content: '""',
        //   position: "absolute",
        //   inset: 0,
        //   backgroundImage: "url('/Background/bg-2.png')",
        //   backgroundRepeat: "no-repeat",
        //   backgroundSize: "cover",
        //   backgroundPosition: "center",
        //   opacity: 0.15,
        //   mixBlendMode: "overlay",
        //   pointerEvents: "none",
        //   zIndex: -1,
        // },
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <Paper
            elevation={0}
            sx={{
              width: 450,
              // height: 325,
              p: 5,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "#fff",
              borderRadius: "30px",
              boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
            }}
          >
            <form onSubmit={handleSubmit}>
              {step === "emailEntry" && (
                <>
                  <Typography
                    sx={{
                      color: "#000",
                      textAlign: "center",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: {
                        xs: "16px", // 0-600px
                        sm: "20px", // 600-900px
                        md: "24px", // 900-1200px
                        lg: "30px", // 1200-1536px
                        xl: "36px", // 1536px+
                      },
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "normal",
                      mb: 2,
                    }}
                  >
                    Forgot password
                  </Typography>
                  <Typography
                    sx={{
                      color: "#000",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: {
                        xs: "08px", // 0-600px
                        sm: "10px", // 600-900px
                        md: "12px", // 900-1200px
                        lg: "14px", // 1200-1536px
                        xl: "16px", // 1536px+
                      },
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "normal",
                      mb: "10px",
                    }}
                  >
                    Email address
                  </Typography>

                  <TextField
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth={false}
                    sx={{
                      width: "356px",
                      height: "56px",
                      flexShrink: 0,
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        border: "1px solid #3EA2FF",
                        height: "56px",
                        "& fieldset": { border: "none" },
                      },
                      "& input": {
                        padding: "10px 12px",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "#D9D9D9",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        opacity: 1,
                      },
                    }}
                  />
                </>
              )}

              {step === "recovery" && (
                <section>
                  <Typography
                    sx={{
                      color: "#000",
                      textAlign: "center",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: {
                        xs: "16px", // 0-600px
                        sm: "20px", // 600-900px
                        md: "24px", // 900-1200px
                        lg: "30px", // 1200-1536px
                        xl: "36px", // 1536px+
                      },
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "normal",
                      mb: 2,
                    }}
                  >
                    Account Recovery
                  </Typography>
                  <Typography
                    sx={{
                      color: "#000",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "normal",
                      mb: "8px",
                      marginLeft: "10px",
                    }}
                  >
                    Enter code
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    {codes.map((code, i) => (
                      <TextField
                        key={i}
                        value={code}
                        inputRef={(el) => (inputsRef.current[i] = el)}
                        onChange={(e) => handleChange(e.target.value, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        onPaste={handlePaste}
                        variant="outlined"
                        InputProps={{
                          sx: {
                            width: "45.127px",
                            height: "56px",
                            borderRadius: "10px",
                            border: "1px solid #D9D9D9",
                            backgroundColor: "#FFF",
                            flexShrink: 0,
                            input: {
                              textAlign: "center",
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "18px",
                              fontStyle: "normal",
                              fontWeight: 500,
                              color: "#000",
                              "&::placeholder": {
                                color: "#D9D9D9",
                                textAlign: "center",
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "14px",
                                fontStyle: "normal",
                                fontWeight: 500,
                                lineHeight: "normal",
                              },
                            },
                          },
                        }}
                        inputProps={{
                          maxLength: 1,
                        }}
                      />
                    ))}
                  </Box>
                </section>
              )}

              {step === "resetPassword" && (
                <>
                  <Typography
                    sx={{
                      color: "#000",
                      textAlign: "center",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: { xs: "28px", lg: "32px", xl: "36px" },
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "normal",
                      mb: 2,
                    }}
                  >
                    Account Recovery
                  </Typography>
                  <Typography
                    sx={{
                      color: "#000",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    New Password
                  </Typography>
                  <TextField
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    sx={{
                      width: "356px",
                      height: "56px",
                      flexShrink: 0,
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        border: "1px solid #3EA2FF",
                        height: "56px",
                        "& fieldset": { border: "none" },
                      },
                      "& input": {
                        padding: "10px 12px",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "#D9D9D9",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        opacity: 1,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((p) => !p)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Typography
                    sx={{
                      color: "#000",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "16px",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Confirm Password
                  </Typography>
                  <TextField
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    sx={{
                      width: "356px",
                      height: "56px",
                      flexShrink: 0,
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        border: "1px solid #3EA2FF",
                        height: "56px",
                        "& fieldset": { border: "none" },
                      },
                      "& input": {
                        padding: "10px 12px",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "#D9D9D9",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        opacity: 1,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword((p) => !p)}
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
                </>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                type="submit"
                sx={{
                  borderRadius: "30px",
                  mt: 1,
                  width: "356px",
                  height: "60px",
                  fontFamily: "Poppins",
                }}
              >
                {step === "emailEntry"
                  ? "Send 6 Digit Code"
                  : step === "recovery"
                  ? "Verify"
                  : "Reset Password"}
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AccountRecovery;
