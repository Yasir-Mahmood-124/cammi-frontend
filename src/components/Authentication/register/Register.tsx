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
import AuthBackground from "@/assests/images/AuthBackground.png";

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
        const sessionId = searchParams.get("session_id");
        const name = searchParams.get("name");
        const email = searchParams.get("email");
        const picture = searchParams.get("picture");
        const sub = searchParams.get("sub");
        const onboardingStatus = searchParams.get("onboarding_status");
        const locale = searchParams.get("locale");
        const id = searchParams.get("id");
        const error = searchParams.get("error");

        if (error) {
          toast("Google sign-in failed", { variant: "error" });
          setIsProcessingGoogle(false);
          return;
        }

        if (sessionId && email) {
          setIsProcessingGoogle(true);

          Cookies.set("token", sessionId, { expires: 7, secure: true });

          const userData = {
            id: id,
            name: name,
            email: email,
            picture: picture,
            sub: sub,
            locale: locale,
          };
          localStorage.setItem("user", JSON.stringify(userData));

          localStorage.setItem(
            "onboarding_status",
            JSON.stringify(onboardingStatus === "true")
          );

          toast("Login successful!", { variant: "success" });

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

  const handleCodeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

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
    if (!/^\d+$/.test(paste)) return;

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
          backgroundImage: `url(${AuthBackground.src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
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
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: !showVerification
                ? { xs: "90%", sm: 340, md: 340, lg: 380, xl: 420 }
                : 450,
              maxWidth: !showVerification
                ? { xs: "90%", sm: 340, md: 340, lg: 380, xl: 420 }
                : 450,
              borderRadius: "30px",
              px: !showVerification ? { xs: 2.5, lg: 3, xl: 3.5 } : 5,
              py: !showVerification ? { xs: 2.5, lg: 3, xl: 3.5 } : 5,
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              boxShadow: !showVerification
                ? "0px 4px 12px rgba(0, 0, 0, 0.1)"
                : "0 8px 15px rgba(0, 0, 0, 0.15)",
            }}
          >
            {!showVerification && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: { xs: 60, lg: 70, xl: 80 },
                    mb: 0.5,
                  }}
                >
                  <Image
                    src={Logo}
                    alt="CAMMI Logo"
                    width={90}
                    height={55}
                    style={{
                      objectFit: "contain",
                      width: "auto",
                      height: "100%",
                      marginBottom: "-2px",
                    }}
                  />
                </Box>
                <Box
                  position="relative"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  sx={{ my: 0.5, marginBottom: "-2px" }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      width: "60%",
                      height: "1.5px",
                      bgcolor: "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 3,
                        height: 3,
                        bgcolor: "#e0e0e0",
                        borderRadius: "50%",
                        ml: -2.5,
                      }}
                    />
                    <Box
                      sx={{
                        width: 3,
                        height: 3,
                        bgcolor: "#e0e0e0",
                        borderRadius: "50%",
                        mr: -2.5,
                      }}
                    />
                  </Box>
                </Box>
              </>
            )}

            {!showVerification ? (
              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <Typography
                  textAlign="center"
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    fontStyle: "normal",
                    fontSize: { xs: "24px", lg: "26px", xl: "28px" },
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    opacity: 1,
                    mt: 0.5,
                    mb: 1.5,
                    width: "100%",
                  }}
                >
                  Sign up
                </Typography>

                <Stack
                  spacing={0.8}
                  sx={{ width: "100%", maxWidth: "90%", marginLeft: "15px" }}
                >
                  {/* First Name and Last Name Row */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ paddingTop: "12px" }}
                  >
                    {/* First Name */}
                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: "#000",
                          fontWeight: 500,
                          fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                          mb: 0.3,
                          textAlign: "left",
                        }}
                      >
                        First Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="firstName"
                        placeholder="Enter first name"
                        variant="outlined"
                        size="small"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-root": {
                            height: { xs: 32, lg: 34, xl: 36 },
                            borderRadius: "8px",
                            fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                          },
                          "& input": {
                            padding: {
                              xs: "6px 12px",
                              lg: "7px 14px",
                              xl: "8px 16px",
                            },
                            fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                            fontWeight: 500,
                          },
                          "& input::placeholder": {
                            opacity: 0.6,
                            fontSize: { xs: "11px", lg: "12px", xl: "12px" },
                            fontWeight: 400,
                          },
                          "& input:-webkit-autofill": {
                            WebkitBoxShadow:
                              "0 0 0 100px #fff inset !important",
                            WebkitTextFillColor: "#000 !important",
                            borderRadius: "8px",
                          },
                          "& input:-webkit-autofill:hover": {
                            WebkitBoxShadow:
                              "0 0 0 100px #fff inset !important",
                          },
                          "& input:-webkit-autofill:focus": {
                            WebkitBoxShadow:
                              "0 0 0 100px #fff inset !important",
                          },
                          "& input:-webkit-autofill:active": {
                            WebkitBoxShadow:
                              "0 0 0 100px #fff inset !important",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#d0d0d0",
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
                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: "#000",
                          fontWeight: 500,
                          fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                          mb: 0.3,
                          textAlign: "left",
                        }}
                      >
                        Last Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="lastName"
                        placeholder="Enter last name"
                        variant="outlined"
                        size="small"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-root": {
                            height: { xs: 32, lg: 34, xl: 36 },
                            borderRadius: "8px",
                            fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                          },
                          "& input": {
                            padding: {
                              xs: "6px 12px",
                              lg: "7px 14px",
                              xl: "8px 16px",
                            },
                            fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                            fontWeight: 500,
                          },
                          "& input::placeholder": {
                            opacity: 0.6,
                            fontSize: { xs: "11px", lg: "12px", xl: "12px" },
                            fontWeight: 400,
                          },
                          "& input:-webkit-autofill": {
                            WebkitBoxShadow:
                              "0 0 0 100px #fff inset !important",
                            WebkitTextFillColor: "#000 !important",
                            borderRadius: "8px",
                          },
                          "& input:-webkit-autofill:hover": {
                            WebkitBoxShadow:
                              "0 0 0 100px #fff inset !important",
                          },
                          "& input:-webkit-autofill:focus": {
                            WebkitBoxShadow:
                              "0 0 0 100px #fff inset !important",
                          },
                          "& input:-webkit-autofill:active": {
                            WebkitBoxShadow:
                              "0 0 0 100px #fff inset !important",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#d0d0d0",
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

                  {/* Email Field */}
                  <Typography
                    sx={{
                      color: "#000",
                      fontWeight: 500,
                      fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                      mb: 0.3,
                      mt: 0.5,
                      textAlign: "left",
                      width: "100%",
                      pt: "8px",
                    }}
                  >
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    placeholder="Email"
                    type="email"
                    variant="outlined"
                    size="small"
                    value={formData.email}
                    onChange={handleInputChange}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: { xs: 32, lg: 34, xl: 36 },
                        borderRadius: "8px",
                        fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                      },
                      "& input": {
                        padding: {
                          xs: "6px 12px",
                          lg: "7px 14px",
                          xl: "8px 16px",
                        },
                        fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                        fontWeight: 500,
                      },
                      "& input::placeholder": {
                        opacity: 0.6,
                        fontSize: { xs: "11px", lg: "12px", xl: "12px" },
                        fontWeight: 400,
                      },
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                        WebkitTextFillColor: "#000 !important",
                        borderRadius: "8px",
                      },
                      "& input:-webkit-autofill:hover": {
                        WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                      },
                      "& input:-webkit-autofill:focus": {
                        WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                      },
                      "& input:-webkit-autofill:active": {
                        WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d0d0d0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#999",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000",
                      },
                    }}
                  />

                  {/* Password Field */}
                  <Typography
                    sx={{
                      color: "#000",
                      fontWeight: 500,
                      fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                      mb: 0.3,
                      mt: 0.5,
                      textAlign: "left",
                      width: "100%",
                      pt: "8px",
                    }}
                  >
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    name="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    size="small"
                    value={formData.password}
                    onChange={handleInputChange}
                    sx={{
                      paddingBottom: "10px",
                      "& .MuiInputBase-root": {
                        height: { xs: 32, lg: 34, xl: 36 },
                        borderRadius: "8px",
                        fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                      },
                      "& input": {
                        padding: {
                          xs: "6px 12px",
                          lg: "7px 14px",
                          xl: "8px 16px",
                        },
                        fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                        fontWeight: 500,
                      },
                      "& input::placeholder": {
                        opacity: 0.6,
                        fontSize: { xs: "11px", lg: "12px", xl: "12px" },
                        fontWeight: 400,
                      },
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                        WebkitTextFillColor: "#000 !important",
                        borderRadius: "8px",
                      },
                      "& input:-webkit-autofill:hover": {
                        WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                      },
                      "& input:-webkit-autofill:focus": {
                        WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                      },
                      "& input:-webkit-autofill:active": {
                        WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d0d0d0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#999",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{
                              color: "#666",
                              "&:hover": { color: "#000" },
                              padding: "4px",
                            }}
                          >
                            {showPassword ? (
                              <VisibilityOff
                                sx={{ fontSize: { xs: 20, lg: 22, xl: 24 } }}
                              />
                            ) : (
                              <Visibility
                                sx={{ fontSize: { xs: 20, lg: 22, xl: 24 } }}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      variant="contained"
                      size="medium"
                      fullWidth
                      type="submit"
                      sx={{
                        borderRadius: "25px",
                        height: { xs: 36, lg: 42, xl: 48 },
                        fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                        fontWeight: 500,
                        textTransform: "none",
                        mt: 1.5,
                        boxShadow: "none",
                        "&:hover": {
                          boxShadow: "none",
                        },
                        "&:active": {
                          boxShadow: "none",
                        },
                        marginBottom: "8px",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing up..." : "Sign up"}
                    </Button>
                  </Box>

                  <Button
                    onClick={handleClickGoogle}
                    variant="outlined"
                    size="medium"
                    fullWidth
                    startIcon={<Google />}
                    sx={{
                      borderRadius: "25px",
                      height: { xs: 36, lg: 42, xl: 48 },
                      fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                      fontWeight: 500,
                      textTransform: "none",
                      mt: 1,
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "none",
                      },
                      "&:active": {
                        boxShadow: "none",
                      },
                    }}
                  >
                    Sign up with Google
                  </Button>
                </Stack>

                <Typography
                  textAlign="center"
                  sx={{
                    color: "#838485",
                    mt: 1,
                    fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                  }}
                >
                  Already have an account?{" "}
                  <Link
                    component={NextLink}
                    href="/sign-in"
                    underline="hover"
                    sx={{
                      color: "secondary.main",
                      fontWeight: 500,
                      fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                    }}
                  >
                    Log in
                  </Link>
                </Typography>
              </form>
            ) : (
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
                  Email Verification
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
                    mb: "8px",
                    marginLeft: "-270px",
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
                  {verificationCode.map((digit, idx) => (
                    <TextField
                      key={idx}
                      value={digit}
                      inputRef={setInputRef(idx)}
                      onChange={(e) => handleCodeChange(idx, e)}
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

                <Button
                  variant="contained"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  size="large"
                  fullWidth
                  sx={{
                    borderRadius: "30px",
                    mt: 1,
                    width: "356px",
                    height: "60px",
                    fontFamily: "Poppins",
                  }}
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
