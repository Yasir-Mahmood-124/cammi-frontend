"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Box, CircularProgress, Typography } from "@mui/material";

const GoogleCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log("Callback params:", params.toString());
    const token = params.get("token");
    const session_id = params.get("session_id");
    const id = params.get("id");

    

    const onboarding_status = params.get("onboarding_status") === "true";

    const user = {
      name: params.get("name"),
      email: params.get("email"),
      picture: params.get("picture"),
      sub: params.get("sub"),
      session_id,
      onboarding_status,
      locale: params.get("locale") === "None" ? null : params.get("locale"),
      access_token: params.get("access_token"),
      expiry: params.get("expiry"),
      id,
    };

    if (token && user.email) {
      Cookies.set("token", session_id ?? "", { expires: 7 });
      console.log("Google token", token);

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("id", id ?? "");
      localStorage.setItem(
        "onboarding_status",
        JSON.stringify(onboarding_status)
      );

      router.replace(onboarding_status ? "/onboarding" : "/dashboard");
    } else {
      console.error("Token or user data missing", { token, user });
    }
  }, [router]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FF3C80, #3EA2FF)",
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            position: "absolute",
            "& div": {
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#4285F4",
              animation: "bounce 1s infinite alternate",
            },
            "& div:nth-of-type(2)": {
              animationDelay: "0.2s",
              backgroundColor: "#0F9D58",
            },
            "& div:nth-of-type(3)": {
              animationDelay: "0.4s",
              backgroundColor: "#F4B400",
            },
            "& div:nth-of-type(4)": {
              animationDelay: "0.6s",
              backgroundColor: "#DB4437",
            },
          }}
        >
          <div />
          <div />
          <div />
          <div />
        </Box>
      </Box>

      <Typography
        variant="h5"
        sx={{ color: "#fff", fontWeight: 500, mb: 1, textAlign: "center" }}
      >
        Logging in with Google...
      </Typography>
      <CircularProgress sx={{ color: "#fff" }} />

      <style jsx global>{`
        @keyframes bounce {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default GoogleCallbackPage;
