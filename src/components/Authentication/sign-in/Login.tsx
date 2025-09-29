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
          justifyItems={"center"}
          gap={4}
          mt={"120px"}
          ml={20}
        >
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyItems={"center"}
          >
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
              py: 8,
              ml: "185px",
              mt: "-200px",
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
              <Typography
                variant="h1"
                textAlign="center"
                sx={{ mb: 2, mt: -3 }}
              >
                Log in
              </Typography>

              <Typography
                variant="h5"
                textAlign="center"
                sx={{ mb: 3, color: "#838485" }}
              >
                New to CAMMI?{" "}
                <Link
                  href="/register"
                  underline="hover"
                  sx={{ color: "secondary.main", fontWeight: 500 }}
                >
                  Sign up for free
                </Link>
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
                    },
                    "& input": {
                      padding: "15px 8px",
                      fontSize: "14px",
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
                    },
                    "& input": {
                      padding: "15px 8px",
                      fontSize: "14px",
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePassword} edge="end">
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
                ></Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Container>

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

export default Login;
