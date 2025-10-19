"use client";

import React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useLazyGetLoginUrlQuery } from "@/redux/services/linkedin/linkedinLoginApi"; // ✅ updated import
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const LinkedInLogin: React.FC = () => {
  const [trigger, { isLoading }] = useLazyGetLoginUrlQuery();

  const handleLogin = async () => {
    try {
      const result = await trigger().unwrap(); // unwrap ensures you get the actual data or throw error
      if (result.login_url) {
        window.location.href = result.login_url;
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 6,
          maxWidth: 420,
          textAlign: "center",
          borderRadius: 4,
        }}
      >
        {/* Heading */}
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
          Log in to continue with your LinkedIn account.
        </Typography>

        {/* Login Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <LinkedInIcon sx={{ fontSize: 26 }} />
            )
          }
          sx={{
            bgcolor: "#0A66C2",
            "&:hover": {
              bgcolor: "#004182",
            },
            py: 1.5,
            fontWeight: 600,
          }}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Sign in with LinkedIn"}
        </Button>
      </Paper>
    </Box>
  );
};

export default LinkedInLogin;