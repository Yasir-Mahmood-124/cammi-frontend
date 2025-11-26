"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Link,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { UpperWave, LowerWave, Google } from "@/assests/icons";
import Image from "next/image";
import Logo from "@/assests/images/Logo.png";
import { useDispatch } from "react-redux"; // ✅ Import useDispatch
import { useLoginMutation } from "@/redux/services/auth/authApi";
import { toast } from "@/utils/toast";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { useLazyGoogleLoginQuery } from "@/redux/services/auth/googleApi";
import { resetAllStates } from "@/redux/actions/resetActions"; // ✅ Import reset action
import NextLink from "next/link";
import AuthBackground from "@/assests/images/AuthBackground.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch(); // ✅ Initialize dispatch
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin] = useLazyGoogleLoginQuery();
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);
  const router = useRouter();
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

          // ✅ Reset all Redux states before setting new session
          console.log("🧹 [Google Login] Resetting all Redux states...");
          dispatch(resetAllStates() as any);

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
  }, [searchParams, router, dispatch]); // ✅ Add dispatch to dependencies

  const handleClick = async () => {
    try {
      const res = await googleLogin().unwrap();

      if (res.login_url) {
        window.location.href = res.login_url;
      } else {
        console.error("No login_url in response", res);
      }
    } catch (err) {
      toast("Failed to initiate Google sign-in", { variant: "error" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast("Please enter email and password", { variant: "warning" });
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();

      // ✅ Reset all Redux states before setting new session
      console.log("🧹 [Manual Login] Resetting all Redux states...");
      dispatch(resetAllStates() as any);

      toast(res.message || "Login successful!", { variant: "success" });

      Cookies.set("token", res.token, { expires: 7, secure: true });

      localStorage.setItem(
        "onboarding_status",
        JSON.stringify(res.onboarding_status)
      );
      localStorage.setItem("user", JSON.stringify(res.user));

      if (res.onboarding_status === true) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast(err?.data?.message || "Login failed", { variant: "error" });
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Show loading state while processing Google callback
  if (isProcessingGoogle) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
          backgroundColor: "#EFF1F5",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ color: "#666" }}>
          Completing sign in with Google...
        </Typography>
      </Box>
    );
  }

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

      // sx={{
      //   position: "relative",
      //   minHeight: "100vh",
      //   display: "flex",
      //   overflow: "hidden",
      //   // backgroundColor: "#EFF1F5",
      //   // background:"linear-gradient(135deg, #E8EBF3 0%, #F5F7FB 50%, #E8ECF5 100%)",
      //   // zIndex: 0,

      //   "&::before": {
      //     content: '""',
      //     position: "absolute",
      //     inset: 0,
      //     backgroundImage: `url(${AuthBackground.src})`,
      //     backgroundRepeat: "no-repeat",
      //     // backgroundSize: "cover",
      //     backgroundPosition: "center",
      //     // opacity: 1, // Add opacity to make it subtle
      //     zIndex: -1,
      //   },
      // }}
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
              width: { xs: "90%", sm: 340, md: 340, lg: 380, xl: 420 },
              maxWidth: { xs: "90%", sm: 340, md: 340, lg: 380, xl: 420 },
              borderRadius: 3,
              px: { xs: 2.5, lg: 3, xl: 3.5 },
              py: { xs: 2.5, lg: 3, xl: 3.5 },
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
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
                style={{ objectFit: "contain", width: "auto", height: "100%" }}
              />
            </Box>
            <Box
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="100%"
              sx={{ my: 0.5 }}
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
                  mt: "-4px",
                  mb: "18px",
                  width: "100%",
                }}
              >
                Log in
              </Typography>

              <Stack
                spacing={0.8}
                sx={{ width: "100%", maxWidth: "90%", marginLeft: "15px" }}
              >
                <Typography
                  sx={{
                    color: "#000",
                    fontWeight: 500,
                    fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                    mb: 0.3,
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  Email address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter Email address"
                  variant="outlined"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    paddingBottom: "10px",
                    "& .MuiInputBase-root": {
                      height: { xs: 32, lg: 34, xl: 36 },
                      borderRadius: "8px",
                      fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                    },
                    "& input": {
                      padding: {
                        xs: "6px 12px", // Reduced vertical padding
                        lg: "7px 14px",
                        xl: "8px 16px",
                      },
                      fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                      fontWeight: 500,
                    },
                    "& input::placeholder": {
                      opacity: 0.6,
                      fontSize: { xs: "11px", lg: "12px", xl: "12px" }, // Smaller font size
                      fontWeight: 400, // Reduced from 500
                    },
                    // Add these autofill styles
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
                <Typography
                  sx={{
                    color: "#000",
                    fontWeight: 500,
                    fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                    mb: 0.3,
                    mt: 0.5,
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  Password
                </Typography>

                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: { xs: 32, lg: 34, xl: 36 },
                      borderRadius: "8px",
                      fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                    },
                    "& input": {
                      padding: {
                        xs: "6px 12px", // Reduced vertical padding
                        lg: "7px 14px",
                        xl: "8px 16px",
                      },
                      fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                      fontWeight: 500,
                    },
                    "& input::placeholder": {
                      opacity: 0.6,
                      fontSize: { xs: "11px", lg: "12px", xl: "12px" }, // Smaller font size
                      fontWeight: 400, // Reduced from 500
                    },
                    // Add these autofill styles
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
                          onClick={handleTogglePassword}
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

                <Box sx={{ pb: 1.5 }}>
                  <Link
                    href="/account-recovery"
                    underline="hover"
                    sx={{
                      alignSelf: "flex-end",
                      fontSize: { xs: "12px", lg: "13px", xl: "14px" },
                      color: "primary.main",
                      display: "block",
                      textAlign: "right",
                      mt: 0.5,
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Box>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    type="submit"
                    sx={{
                      borderRadius: "25px",
                      height: { xs: 42, lg: 46, xl: 50 },
                      fontSize: { xs: "14px", lg: "15px", xl: "16px" },
                      fontWeight: 500,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "none",
                      },
                      "&:active": {
                        boxShadow: "none",
                      },
                      marginBottom: "10px",
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                </Box>

                <Button
                  onClick={handleClick}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  startIcon={<Google />}
                  sx={{
                    borderRadius: "25px",
                    height: { xs: 42, lg: 46, xl: 50 },
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
                  Sign in with Google
                </Button>
              </Stack>
            </form>
            <Typography
              textAlign="center"
              sx={{
                color: "#838485",
                mt: 1,
                fontSize: { xs: "13px", lg: "14px", xl: "15px" },
              }}
            >
              New to CAMMI?{" "}
              <Link
                component={NextLink}
                href="/register"
                underline="hover"
                sx={{
                  color: "secondary.main",
                  fontWeight: 500,
                  fontSize: { xs: "13px", lg: "14px", xl: "15px" },
                }}
              >
                Sign up for free
              </Link>
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
