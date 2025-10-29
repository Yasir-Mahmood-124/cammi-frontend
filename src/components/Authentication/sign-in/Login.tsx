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
import { useLoginMutation } from "@/redux/services/auth/authApi";
import { toast } from "@/utils/toast";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { useLazyGoogleLoginQuery } from "@/redux/services/auth/googleApi";
import NextLink from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          pointerEvents: "none",
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
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
              width: 400,
              borderRadius: 4,
              px: 4,
              py: 4,
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              boxShadow: "0px 8px 15px 2px #00000026",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: 80,
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
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="100%"
              sx={{ my: 0 }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: "60%",
                  height: "2px",
                  bgcolor: "#e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
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
            </Box>
            <form onSubmit={handleSubmit}>
              <Typography
                textAlign="center"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontStyle: "normal",
                  fontSize: "30px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  opacity: 1,
                  mt: 0,
                  mb: 2,
                  width: "300px",
                }}
              >
                Log in
              </Typography>

              <Stack spacing={1}>
                <Typography
                  variant="h6"
                  sx={{ color: "#000", fontWeight: "bold" }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter Email address"
                  variant="outlined"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 45,
                      borderRadius: "10px",
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
                <Typography
                  variant="h6"
                  sx={{ color: "#000", fontWeight: "bold" }}
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
                      height: 45,
                      borderRadius: "10px",
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                          sx={{
                            color: "#666",
                            "&:hover": { color: "#000" },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Link
                  href="/account-recovery"
                  underline="hover"
                  sx={{
                    alignSelf: "flex-end",
                    fontSize: "0.9rem",
                    color: "primary.main",
                  }}
                >
                  Forgot password?
                </Link>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  type="submit"
                  sx={{ mt: 1, borderRadius: "30px" }}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
                <Button
                  onClick={handleClick}
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Google />}
                  sx={{ borderRadius: "30px" }}
                >
                  Sign in with Google
                </Button>
              </Stack>
            </form>
            <Typography
              variant="h5"
              textAlign="center"
              sx={{ color: "#838485", mt: "10px" }}
            >
              New to CAMMI?{" "}
              <Link
                component={NextLink}
                href="/register"
                underline="hover"
                sx={{ color: "secondary.main", fontWeight: 500 }}
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
