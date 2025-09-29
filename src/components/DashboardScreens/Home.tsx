"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Description,
  Person,
  Timeline,
  Message,
  BrandingWatermark,
} from "@mui/icons-material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const docOptions = [
  { title: "GTM Document Generation", icon: <Description /> },
  { title: "Ideal Customer Profile", icon: <Person /> },
  { title: "Strategy roadmap", icon: <Timeline /> },
  { title: "Messaging Framework", icon: <Message /> },
  { title: "Brand Identity", icon: <BrandingWatermark /> },
];

const Home = () => {
  const [selected, setSelected] = useState(1);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #fef6ff, #e5f3ff)",
        px: 2,
        gap: 4,
      }}
    >
      <Typography
        sx={{
          top: 221,
          left: 527,
          width: 462,
          height: 28,
          fontFamily: "Glacial Indifference, sans-serif",
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "29px",
          lineHeight: "100%",
          letterSpacing: "0%",
          verticalAlign: "middle",
          opacity: 1,
          transform: "rotate(0deg)",
        }}
      >
        Welcome, <b>Marhaba Hashmi</b>!
      </Typography>

      <Typography
        sx={{
          top: 315,
          left: 407,
          width: 655,
          height: 28,
          fontFamily: "Glacial Indifference, sans-serif",
          fontWeight: 700,
          fontStyle: "normal",
          fontSize: "40px",
          lineHeight: "100%",
          letterSpacing: "0%",
          verticalAlign: "middle",
          opacity: 1,
          transform: "rotate(0deg)",
        }}
      >
        Generate Your Document Instantly
      </Typography>

      <Stack direction="row" spacing={2} mb={4}>
        {docOptions.map((option, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => setSelected(index)}
            startIcon={option.icon}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              px: 2,
              py: 1.5,
              width: "163px",
              height: "138px",
              gap: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",

              border: "2px solid transparent",
              background:
                selected === index
                  ? `
            linear-gradient(white, white) padding-box,
            linear-gradient(90deg, #3EA3FF, #FF3C80) border-box
          `
                  : "white",

              ...(selected === index && {
                background: `
            linear-gradient(to right, #fef6ff, #e5f3ff) padding-box,
            linear-gradient(90deg, #3EA3FF, #FF3C80) border-box
          `,
              }),

              "&:hover": {
                background: `
            linear-gradient(0deg, #FFFFFF, #FFFFFF) padding-box,
            linear-gradient(90deg, #3EA3FF, #FF3C80) border-box,
            radial-gradient(53.71% 149.44% at 89.65% -24.61%, rgba(95,176,254,0.2), rgba(255,255,255,0)),
            radial-gradient(49.41% 235.67% at -12.5% 110.55%, rgba(251,86,145,0.2), rgba(255,255,255,0))
          `,
              },

              "& .MuiButton-startIcon": {
                margin: 0,
              },
              "& .MuiButton-startIcon > *:nth-of-type(1)": {
                fontSize: 60,
                width: "36px",
                height: "36px",
              },
            }}
          >
            {option.title}
          </Button>
        ))}
      </Stack>

      <Typography
        sx={{
          top: 578,
          left: 499,
          width: 443,
          height: 18,
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          fontStyle: "normal",
          fontSize: "26px",
          lineHeight: "100%",
          letterSpacing: "0%",
          verticalAlign: "middle",
          opacity: 1,
          transform: "rotate(0deg)",
        }}
      >
        What business idea do you have?
      </Typography>

      <TextField
        placeholder="Describe what you want to generate"
        variant="outlined"
        fullWidth
        multiline
        minRows={3}
        sx={{
          width: "857px",
          height: "130px",
          fontSize: "20px",
          "& .MuiInputBase-input::placeholder": {
            color: "#8A8787",
            opacity: 1,
          },
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#fff",

            borderRadius: "12px",
            "& fieldset": {
              borderWidth: "2px",

              borderStyle: "solid",
              borderImageSource:
                "linear-gradient(90deg, #3EA3FF 0%, #FF3C80 100%)",
              borderImageSlice: 1,
            },
            "&:hover fieldset, &.Mui-focused fieldset": {
              borderImageSource:
                "linear-gradient(90deg, #3EA3FF 0%, #FF3C80 100%)",
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AttachFileIcon
                sx={{ color: "black", mt: 5, transform: "rotate(45deg)" }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                sx={{
                  backgroundColor: "#e0e0e0",
                  borderRadius: "50%",
                  width: 50,
                  height: 50,
                  p: 0,
                  mt: 5,
                }}
              >
                <KeyboardArrowUpIcon
                  sx={{
                    color: "black",
                    fontSize: 40,
                    transform: "scale(1, 1)",
                  }}
                />

                {/* <ExpandLessIcon sx={{ color: "black", fontSize: 40 }} /> */}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
export default Home;
