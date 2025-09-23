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
} from "@mui/material";
import { UpperWave, LowerWave, Google } from "@/assests/icons";
import Image from "next/image";
import Logo from "@/assests/images/Logo.png";
import { useLoginMutation } from "@/redux/services/auth/authApi";
import { toast } from "@/utils/toast";
import Cookies from "js-cookie";


const LoginPage = () => {
  // 🔹 State for form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 RTK Query hook
  const [login, { isLoading }] = useLoginMutation();

// 🔹 Handle submit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) {
    toast("⚠️ Please enter email and password", { variant: "warning" });
    return;
  }

  try {
    const res = await login({ email, password }).unwrap();
    // Success 🎉
    toast(res.message || "✅ Login successful!", { variant: "success" });

    // 🔹 Save token in cookie
    Cookies.set("token", res.token, { expires: 7, secure: true });

    console.log("User:", res.user, "Token:", res.token);
  } catch (err: any) {
    // Error 🚨
    toast(err?.data?.message || "❌ Login failed", { variant: "error" });
  }
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#EFF1F5",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Top Wave ──────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          mt: "-50px",
        }}
      >
        <UpperWave />
      </Box>

      {/* ─── Main Content ──────────────────────────── */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          zIndex: 1,
        }}
      >
        {/* ─── Logo ─────────────────────── */}
        <Box sx={{ mb: 2 }}>
          <Image
            src={Logo}
            alt="CAMMI Logo"
            width={110}
            height={70}
            style={{ objectFit: "contain" }}
          />
        </Box>

        {/* ─── Headings ─────────────────── */}
        <Box sx={{ ml: "217px" }}>
          <Typography variant="h1" sx={{ color: "#000", lineHeight: 1.2 }}>
            CAMMI:&nbsp;
            <Box component="span" sx={{ color: "secondary.main" }}>
              Your AI-Powered
            </Box>
          </Typography>
          <Typography variant="h1" sx={{ color: "#000", mt: 0.5, ml: "42px" }}>
            Marketing BFF
          </Typography>
        </Box>

        {/* ─── Cards Row ─────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 6,
            flexWrap: "wrap",
            ml: "176px",
          }}
        >
          {/* Dummy Feature Card */}
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

          {/* Login Card */}
          <Paper
            elevation={0}
            sx={{
              width: 360,
              borderRadius: 4,
              p: 4,
              ml: "185px",
              mt: "-109px",
              backgroundImage: `
                linear-gradient(0deg, #FFFFFF, #FFFFFF),
                radial-gradient(60.56% 29.04% at 12.44% 38.31%, #E5F1FF 0%, rgba(229, 241, 255, 0) 100%),
                radial-gradient(123% 99.69% at 92.11% 87.77%, #F8F0F8 0%, rgba(255, 255, 255, 0) 100%),
                radial-gradient(98.89% 58.11% at 96.78% 1.46%, #EAF3FF 0%, rgba(255, 255, 255, 0) 100%)
              `,
              boxShadow: "0px 8px 15px 2px #00000026",
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Heading */}
              <Typography variant="h1" textAlign="center" sx={{ mb: 2 }}>
                Log in
              </Typography>

              {/* New to CAMMI */}
              <Typography
                variant="h5"
                textAlign="center"
                sx={{ mb: 3, color: "#838485" }}
              >
                New to CAMMI?{" "}
                <Link
                  href="#"
                  underline="hover"
                  sx={{ color: "secondary.main", fontWeight: 500 }}
                >
                  Sign up for free
                </Link>
              </Typography>

              <Stack spacing={2}>
                {/* Email */}
                <Typography variant="h6" sx={{ color: "#000" }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password */}
                <Typography variant="h6" sx={{ color: "#000" }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Enter your password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Forgot Password */}
                <Link
                  href="#"
                  underline="hover"
                  sx={{
                    alignSelf: "flex-end",
                    fontSize: "0.9rem",
                    color: "primary.main",
                  }}
                >
                  Forgot password?
                </Link>

                {/* Login Button */}
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

                {/* Google Button */}
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Google />}
                  sx={{ borderRadius: "30px" }}
                >
                  Continue with Google
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Container>

      {/* ─── Bottom Wave ───────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
        }}
      >
        <LowerWave style={{ height: "180px" }} />
      </Box>
    </Box>
  );
};

export default LoginPage;
