"use client";
import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  List,
  ListItem,
} from "@mui/material";
import { Home } from "@mui/icons-material";

const steps = [
  { title: "Clarify", color: "#D48CF5" },
  { title: "Align", color: "#A78BFA" },
  { title: "Mobilize", color: "#F472B6" },
  { title: "Monitor", color: "#60A5FA" },
  { title: "Iterate", color: "#FCA5A5" },
];

const documents = [
  "GTM Document",
  "ICP Document",
  "GTM Document",
  "GTM Document",
  "GTM Document",
  "GTM Document",
];

const Dashboard = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        // background: "linear-gradient(to bottom, #F8EFFF, #E0F2FF)",
        background: "linear-gradient(135deg, #F5DDEB, #D2EDFE)",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
      }}
    >
      {/* ─── Top Bar ───────────────────── */}
      <Box
        sx={{ width: "100%", display: "flex", justifyContent: "flex-start" }}
      >
        <Paper
          elevation={2}
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <Home
            fontSize="small"
            sx={{
              color: "#fff", // white fill
              stroke: "#000", // black border
              strokeWidth: 1.5, // thickness of the border
            }}
          />

          <Typography
            variant="body2"
            sx={{
              color: "#000",
              textAlign: "center",
              fontFamily: "Poppins",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
            }}
          >
            Home
          </Typography>
        </Paper>
      </Box>

      {/* ─── Heading ───────────────────── */}
      <Box textAlign="center" mt={6} mb={4}>
        <Typography
          variant="h1"
          sx={{
            color: "#000",
            fontFamily: "Glacial Indifference",
            fontSize: "48px",
            fontWeight: 700,
            fontStyle: "normal",
            lineHeight: "28px", // Be aware, this is very tight for 48px font-size
            letterSpacing: "0.938px",
          }}
        >
          Create with CAMMI
        </Typography>

        <Typography
          variant="h3"
          sx={{
            color: "#000", // overrides color="text.secondary"
            fontFamily: "Poppins",
            fontSize: "20px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "28px", // 140%
            letterSpacing: "0.391px",
          }}
          mt={1}
        >
          How would you like to get started?
        </Typography>
      </Box>

      {/* ─── Cards ───────────────────── */}

      {/* <Stack
        direction="row"
        gap={4}
        flexWrap="wrap"
        justifyContent="center"
        sx={{ mt: 4 }}
      >
        {steps.map((step, i) => (
          <Paper
            key={i}
            elevation={4}
            sx={{
              width: 220,
              borderRadius: "12px",
              // p: 2,

              // background: "linear-gradient(to bottom, #F5DDEB, #D2EDFE)",
              background: "linear-gradient(135deg, #E5F3FF, #83C3FF)",

              cursor: "pointer",
              overflow: "hidden",
              transition: "all 0.7s ease",
              maxHeight: 180, // default (shows ~3 docs)
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                maxHeight: 600, // smoothly expands
              },
            }}
          >
            <Paper
              elevation={0} // remove default shadow since we’re adding custom shadows
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "180px",
                height: "70px",
                borderRadius: 3,
                textAlign: "center",
                background:
                  "linear-gradient(180deg, rgba(236, 244, 254, 0.50) 0%, rgba(248, 240, 248, 0.50) 100%)",

                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)", // Safari support
                filter:
                  "drop-shadow(0 2px 0 rgba(0, 0, 0, 0.15)) drop-shadow(0 -1px 0 #FFF)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)", // expand on hover
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  display: "inline-block",
                  fontSize: "60px",
                  fontFamily: "Glacial Indifference",
                  fontWeight: 700,
                  background:
                    "linear-gradient(238deg, #3FA2FE 16.28%, #FF3C80 109.71%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {step.title[0]}
                <Box
                  component="span"
                  sx={{
                    color: "black",
                    ml: 0.5,
                    fontSize: 25,
                  }}
                >
                  {step.title.slice(1)}
                </Box>
              </Typography>
            </Paper>

            <List dense>
              {documents.map((doc, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    py: 0.5,
                    fontSize: "0.9rem",
                    color: "text.secondary",
                  }}
                >
                  • {doc}
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}
      </Stack> */}

      <Stack
        direction="row"
        gap={4}
        flexWrap="wrap"
        justifyContent="center"
        sx={{ mt: 8 }}
      >
        {steps.map((step, i) => (
          <Box
            key={i}
            sx={{
              position: "relative",
              width: 220,
            }}
          >
            {/* Main Card */}
            <Paper
              elevation={4}
              sx={{
                width: "210px",
                height: "150px",
                flexShrink: 0,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #E5F3FF, #83C3FF)",
                cursor: "pointer",
                overflow: "hidden",
                transition:
                  "transform 0.5s ease, box-shadow 0.5s ease, height 0.5s ease",
                pt: 5, // space for floating header
                "&:hover": {
                  transform: "scale(1.05)", // smooth expand
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  height: "200px", // expand height
                },
              }}
            >
              {/* Document List */}
              <Box sx={{ p: 1 }}>
                <List dense>
                  {documents.map((doc, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        py: 0.6,
                        fontFamily: "Poppins",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: 400,
                        lineHeight: "20px", // 142.857%
                        color: "#1B3E5E",
                        textAlign: "center",
                      }}
                    >
                      • {doc}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>

            {/* Floating Step Header */}
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                top: -30,
                left: "40%",
                width: "180px",
                height: "70px",
                transform: "translateX(-50%)",
                px: 3,
                py: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 3,
                background:
                  "linear-gradient(180deg, rgba(236,244,254,0.85) 0%, rgba(248,240,248,0.85) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                filter:
                  "drop-shadow(0 2px 0 rgba(0, 0, 0, 0.15)) drop-shadow(0 -1px 0 #FFF)",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  // width: "103px",
                  // height: "31px",
                  display: "inline-block",
                  fontSize: "60px",
                  fontFamily: "Glacial Indifference",
                  fontWeight: 700,
                  lineHeight: 1,
                  background:
                    "linear-gradient(238deg, #3FA2FE 16.28%, #FF3C80 109.71%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {step.title[0]}
                <Box
                  component="span"
                  sx={{
                    color: "black",
                    ml: 0.5,
                    fontSize: 18,
                  }}
                >
                  {step.title.slice(1)}
                </Box>
              </Typography>
            </Paper>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Dashboard;
