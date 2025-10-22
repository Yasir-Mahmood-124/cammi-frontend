"use client";
import React, { useState } from "react";
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
} from "@mui/material";
import { UpperWave, LowerWave, Google } from "@/assests/icons";
import Image from "next/image";
import Logo from "@/assests/images/Logo.png";
import { useLoginMutation } from "@/redux/services/auth/authApi";
import { toast } from "@/utils/toast";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useLazyGoogleLoginQuery } from "@/redux/services/auth/googleApi";
import NextLink from "next/link";
// import Link from "@mui/material/Link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin] = useLazyGoogleLoginQuery();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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

    if (!email || !password) {
      toast(" Please enter email and password", { variant: "warning" });
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();

      toast(res.message || " Login successful!", { variant: "success" });

      Cookies.set("token", res.token, { expires: 7, secure: true });

      localStorage.setItem(
        "onboarding_status",
        JSON.stringify(res.onboarding_status)
      );
      localStorage.setItem("user", JSON.stringify(res.user));

      console.log("User:", res.user, "Token:", res.token);

      if (res.onboarding_status === true) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast(err?.data?.message || " Login failed", { variant: "error" });
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        overflow: "hidden",
        backgroundColor: "#EFF1F5",
        zIndex: 0, // base layer

        // 👇 Background layer (behind everything)
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/Background/Background.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
          zIndex: -2, // make it go behind all content
        },

        // 👇 Overlay layer (also behind everything)
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
          zIndex: -1, // also behind content
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
            // gap: 10,
            flexWrap: "wrap",
            // ml: "200px",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: 400,
              borderRadius: 4,
              px: 4,
              py: 4,
              // ml: "185px",
              // mt: "-200px",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              boxShadow: "0px 8px 15px 2px #00000026",
            }}
          >
            {" "}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: 80,
                // mt: 2,
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
              {/* Line with dots */}
              <Box
                sx={{
                  position: "absolute",
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
            </Box>
            <form onSubmit={handleSubmit}>
              <Typography
                textAlign="center"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontStyle: "normal", // "SemiBold" isn't a CSS value, 600 covers it
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
                            color: "#666", // adjust to your theme
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
