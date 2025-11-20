"use client";

import React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useLazyGetLoginUrlQuery } from "@/redux/services/linkedin/linkedinLoginApi";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const LinkedInLogin: React.FC = () => {
  const [trigger, { isLoading }] = useLazyGetLoginUrlQuery();

  const handleLogin = async () => {
    try {
      const result = await trigger().unwrap();
      if (result.login_url) {
        window.location.href = result.login_url;
      }
    } catch (error) {
      // console.error("Login failed", error);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Grey backdrop
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 6,
          maxWidth: 450,
          width: "100%",
          textAlign: "center",
          borderRadius: 3,
          position: "relative",
          animation: "fadeIn 0.3s ease-in-out",
          "@keyframes fadeIn": {
            from: {
              opacity: 0,
              transform: "scale(0.9)",
            },
            to: {
              opacity: 1,
              transform: "scale(1)",
            },
          },
        }}
      >
        {/* Heading */}
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 500, color: "text.primary", fontSize: "36px", marginBottom: "30px" }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "#000000", fontSize: "14px" }}>
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
            bgcolor: "#3EA2FF",
            // "&:hover": {
            //   bgcolor: "#004182",
            // },
            py: 1.5,
            px: 3,
            fontWeight: 600,
            textTransform: "none",
            fontSize: "1rem",
            borderRadius: "36px",
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