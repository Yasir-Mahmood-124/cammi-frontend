"use client";
import { createTheme } from "@mui/material";
import colors from "./colors";

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    success: {
      main: colors.success,
    },
    error: {
      main: colors.error,
    },
  },
  typography: {
    fontFamily: "Glacial Indifference, Inter, Roboto, Arial, sans-serif", // You can change this to your preferred font
    htmlFontSize: 16, // Base font size
    h1: {
      fontSize: "36px",
      fontWeight: 500,
      lineHeight: "44px",
      letterSpacing: "-0.02em",
      color: colors.heading,
      "@media (max-width:1200px)": {
        fontSize: "32px",
        lineHeight: "40px",
      },
      "@media (max-width:768px)": {
        fontSize: "28px",
        lineHeight: "36px",
      },
      "@media (max-width:480px)": {
        fontSize: "24px",
        lineHeight: "32px",
      },
    },
    h2: {
      // Sub heading: 18px, weight 500
      fontSize: "18px",
      fontWeight: 500,
      lineHeight: "24px",
      letterSpacing: "-0.01em",
      color: colors.heading,
      "@media (max-width:768px)": {
        fontSize: "16px",
        lineHeight: "22px",
      },
    },
    h3: {
      fontSize: "24px",
      fontWeight: 500,
      lineHeight: "32px",
      letterSpacing: "-0.01em",
      color: colors.heading,
      "@media (max-width:768px)": {
        fontSize: "20px",
        lineHeight: "28px",
      },
    },
    h4: {
      fontSize: "20px",
      fontWeight: 500,
      lineHeight: "28px",
      color: colors.heading,
    },
    h5: {
      fontSize: "18px",
      fontWeight: 500,
      lineHeight: "24px",
      color: colors.heading,
    },
    h6: {
      fontSize: "16px",
      fontWeight: 500,
      lineHeight: "22px",
      color: colors.heading,
    },
    body1: {
      // Text: 16px, weight 500
      fontSize: "16px",
      fontWeight: 500,
      lineHeight: "22px",
      color: colors.heading,
      "@media (max-width:768px)": {
        fontSize: "14px",
        lineHeight: "20px",
      },
    },
    body2: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
      color: colors.heading,
      "@media (max-width:768px)": {
        fontSize: "12px",
        lineHeight: "18px",
      },
    },
    subtitle1: {
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "20px",
      letterSpacing: "0.01em",
      color: colors.heading,
    },
    caption: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "16px",
      letterSpacing: "0.02em",
      color: colors.common,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          "@media (max-width: 599px)": {
            paddingInline: "16px !important",
          },
          "@media (max-width: 1079px) and (min-width: 600px)": {
            paddingInline: "24px !important",
          },
          "@media (max-width: 1199px) and (min-width: 1080px)": {
            paddingInline: "32px !important",
          },
          "@media (max-width: 1439px) and (min-width: 1200px)": {
            paddingInline: "40px !important",
          },
          "@media (min-width: 1440px)": {
            paddingInline: "80px !important",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: "none",
          fontWeight: 500,
          borderRadius: "8px",
          textTransform: "none",
          letterSpacing: "0.01em",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-1px)",
          },
          "&.Mui-disabled": {
            color: "#fff",
            background: colors.disabled,
          },
        },
        contained: {
          color: "#fff",
          backgroundColor: colors.primary,
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#2B8CE6",
            color: "#fff",
          },
        },
        text: {
          color: colors.primary,
          background: "transparent",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "rgba(62, 162, 255, 0.08)",
            color: colors.primary,
          },
        },
        outlined: {
          transition: "0.2s ease-in-out",
          background: "#fff",
          border: `1px solid ${colors.outline}`,
          borderRadius: "8px",
          color: colors.heading,
          "&:hover": {
            border: `1px solid ${colors.primary}`,
            backgroundColor: "rgba(62, 162, 255, 0.04)",
            color: colors.heading,
          },
        },
        sizeLarge: {
          fontSize: "16px",
          padding: "12px 24px",
          fontWeight: 500,
        },
        sizeMedium: {
          fontSize: "14px",
          padding: "10px 20px",
          borderRadius: "8px",
          fontWeight: 500,
        },
        sizeSmall: {
          fontSize: "12px",
          padding: "8px 16px",
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-input::placeholder": {
            color: colors.placeholder,
            opacity: 1,
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: colors.outline,
            },
            "&:hover fieldset": {
              borderColor: colors.primary,
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
  },
});

export default theme;