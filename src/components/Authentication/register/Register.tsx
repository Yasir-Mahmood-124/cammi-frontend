

"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  IconButton,
  InputAdornment,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Image from "next/image";
import Logo from "@/assests/images/Logo.png";
import { Google } from "@/assests/icons";
import { toast } from "@/utils/toast";
import { getErrorMessage } from "@/utils/handleApiError";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useRegisterMutation,
  useVerifyEmailMutation,
} from "@/redux/services/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { validatePassword } from "@/utils/validators";
import { useLazyGoogleLoginQuery } from "@/redux/services/auth/googleApi";
import NextLink from "next/link";
import Cookies from "js-cookie";


const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill("")
  );

  const [register, { isLoading }] = useRegisterMutation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [googleLogin] = useLazyGoogleLoginQuery();
  const router = useRouter();
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);
  const searchParams = useSearchParams();

    // Handle Google OAuth callback
    useEffect(() => {
      const handleGoogleCallback = () => {
        try {
          // Check if we have Google callback parameters
          const sessionId = searchParams.get("session_id");
          const name = searchParams.get("name");
          const email = searchParams.get("email");
          const picture = searchParams.get("picture");
          const sub = searchParams.get("sub");
          const onboardingStatus = searchParams.get("onboarding_status");
          const locale = searchParams.get("locale");
          const id = searchParams.get("id");
          const error = searchParams.get("error");
  
          // Handle error case
          if (error) {
            toast("Google sign-in failed", { variant: "error" });
            setIsProcessingGoogle(false);
            return;
          }
  
          // If we have session_id, process the Google login
          if (sessionId && email) {
            setIsProcessingGoogle(true);
  
            // Store session_id as token in cookies (same as manual login)
            Cookies.set("token", sessionId, { expires: 7, secure: true });
  
            // Store user data in localStorage
            const userData = {
              id: id,
              name: name,
              email: email,
              picture: picture,
              sub: sub,
              locale: locale,
            };
            localStorage.setItem("user", JSON.stringify(userData));
  
            // Store onboarding status
            localStorage.setItem(
              "onboarding_status",
              JSON.stringify(onboardingStatus === "true")
            );
  
            // Show success message
            toast("Login successful!", { variant: "success" });
  
            // Redirect based on onboarding status
            if (onboardingStatus === "true") {
              router.push("/onboarding");
            } else {
              router.push("/dashboard");
            }
          }
        } catch (err) {
          toast("Authentication failed", { variant: "error" });
          setIsProcessingGoogle(false);
        }
      };
  
      handleGoogleCallback();
    }, [searchParams, router]);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClickGoogle = async () => {
    try {
      const res = await googleLogin().unwrap();
      if (res.login_url) window.location.href = res.login_url;
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
      await register(formData).unwrap();
      toast("Registration successful!", { variant: "success" });
      setShowVerification(true);
    } catch (err) {
      toast(getErrorMessage(err), { variant: "error" });
    }
  };

  // Handles typing + backspace
  const handleCodeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return; // only digits

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (!value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(paste)) return; // only digits

    const digits = paste.slice(0, 6).split("");
    const newCode = [...verificationCode];
    digits.forEach((d, i) => {
      if (i < 6) newCode[i] = d;
    });
    setVerificationCode(newCode);

    const nextIndex = Math.min(digits.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      toast("Please enter all 6 digits.", { variant: "warning" });
      return;
    }
    try {
      await verifyEmail({ email: formData.email, code }).unwrap();
      toast("Email verified successfully!", { variant: "success" });
      router.push("/sign-in");
    } catch (err) {
      toast(getErrorMessage(err), { variant: "error" });
    }
  };
  const setInputRef = (idx: number) => (el: HTMLInputElement | null) => {
    inputsRef.current[idx] = el;
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
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
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/Background/bg-2.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          mixBlendMode: "overlay",
          zIndex: -1,
        },
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: 400,
            borderRadius: 4,
            px: 4,
            py: 5,
            backgroundColor: "#fff",
            boxShadow: "0px 8px 15px 2px #00000026",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {!showVerification && (
            <>
              <Image
                src={Logo}
                alt="CAMMI Logo"
                width={110}
                height={70}
                style={{ objectFit: "contain" }}
              />
              {/* Line with dots */}
              <Box
                sx={{
                  // position: "absolute",
                  width: "60%",
                  height: "2px",
                  bgcolor: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5, // space inside for dots
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    bgcolor: "#e0e0e0",
                    borderRadius: "50%",
                    ml: -3,
                  }}
                />
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    bgcolor: "#e0e0e0",
                    borderRadius: "50%",
                    mr: -3,
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "30px",
                  textAlign: "center",
                  mt: 1,
                  mb: 2,
                }}
              >
                Sign up
              </Typography>
            </>
          )}

          {!showVerification ? (
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5}>
                  <Stack direction="row" spacing={1.5}>
                    {/* First Name */}
                    <Stack spacing={1} sx={{ width: "100%" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#000",
                          fontWeight: "bold",
                          fontSize: "16px",
                        }}
                      >
                        First Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="firstName"
                        placeholder="Enter first name"
                        size="small"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: "10px",
                            height: 45,
                          },
                          "& input": {
                            padding: "15px 8px",
                            fontSize: "14px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#ccc",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#999",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#000",
                          },
                        }}
                      />
                    </Stack>

                    {/* Last Name */}
                    <Stack spacing={1} sx={{ width: "100%" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#000",
                          fontWeight: "bold",
                          fontSize: "16px",
                        }}
                      >
                        Last Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="lastName"
                        placeholder="Enter last name"
                        size="small"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-root": {
                            borderRadius: "10px",
                            height: 45,
                          },
                          "& input": {
                            padding: "15px 8px",
                            fontSize: "14px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#ccc",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#999",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#000",
                          },
                        }}
                      />
                    </Stack>
                  </Stack>
                </Stack>

                {/* Email Field */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "#000", fontWeight: "bold", mb: 0.5 }}
                  >
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    placeholder="Email"
                    type="email"
                    size="small"
                    value={formData.email}
                    onChange={handleInputChange}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "10px",
                        height: 45,
                      },
                    }}
                  />
                </Box>

                {/* Password Field */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "#000", fontWeight: "bold", mb: 0.5 }}
                  >
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    name="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    size="small"
                    value={formData.password}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        borderRadius: "10px",
                        height: 45,
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{ borderRadius: "30px", py: 1.5 }}
                >
                  {isLoading ? "Signing up..." : "Sign up"}
                </Button>

                <Button
                  onClick={handleClickGoogle}
                  variant="outlined"
                  startIcon={<Google />}
                  fullWidth
                  sx={{ borderRadius: "30px", py: 1.5 }}
                >
                  Sign up with Google
                </Button>

                <Typography textAlign="center" sx={{ mt: 1, color: "#838485" }}>
                  Already have an account?{" "}
                  <Link
                    component={NextLink}
                    href="/sign-in"
                    underline="hover"
                    sx={{ color: "#FF3C80", fontWeight: 500 }}
                  >
                    Log in
                  </Link>
                </Typography>
              </Stack>
            </form>
          ) : (
            <>
              <Typography
                variant="h5"
                sx={{
                  color: "#000",
                  textAlign: "center",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "36px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                }}
              >
                Email Verification
              </Typography>
              <Typography
                sx={{
                  color: "#000",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                  mb: "-10px",
                  ml: "4px",
                  alignSelf: "flex-start",
                }}
              >
                Enter code
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="center" mb={0}>
                {verificationCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={setInputRef(idx)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e)}
                    onPaste={handlePaste}
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
                    }}
                  />
                ))}
              </Stack>

              <Button
                variant="contained"
                onClick={handleVerify}
                disabled={isVerifying}
                fullWidth
                sx={{ py: 1.5, borderRadius: "30px" }}
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
