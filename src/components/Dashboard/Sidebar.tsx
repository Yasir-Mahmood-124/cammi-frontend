"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import Image from "next/image";
import Logo from "../../assests/images/Logo.png";
import AddIcon from "@mui/icons-material/Add";

// --------- ICON IMPORTS ----------
import {
  BS,
  Dashboard,
  GTM,
  ICP,
  KMF,
  LeadCalculator,
  Projects,
  Scheduler,
  SR,
} from "@/assests/icons";

const Sidebar: React.FC = () => {
  const [selected, setSelected] = useState<string>("Dashboard");

  // -------- MENU ITEMS --------
  const menuItems = [
    { label: "Dashboard", icon: <Dashboard /> },
    { label: "Projects", icon: <Projects /> },
  ];

  // -------- DOCUMENT ITEMS --------
  const documentItems = [
    { label: "GTM Document", icon: <GTM /> },
    { label: "ICP Document", icon: <ICP /> },
    { label: "Strategy Roadmap", icon: <SR /> },
    { label: "Messaging Framework", icon: <KMF /> },
    { label: "Brand Identity", icon: <BS /> },
  ];

  // -------- TOOL ITEMS --------
  const toolItems = [
    { label: "Lead Calculator", icon: <LeadCalculator /> },
    { label: "Scheduler", icon: <Scheduler /> },
  ];

  // -------- Helper Function --------
  const getIconFilter = (label: string, isSelected: boolean) => {
    // For icons that are originally white (so they invert incorrectly)
    const reverseIcons = ["Dashboard"]; // Add more labels here if needed
    const isReversed = reverseIcons.includes(label);

    if (isReversed) {
      // Reverse the logic (white base SVG)
      return isSelected ? "invert(0)" : "invert(1) brightness(2)";
    } else {
      // Normal logic (black base SVG)
      return isSelected ? "invert(1) brightness(2)" : "invert(0)";
    }
  };

  return (
    <Box
      sx={{
        width: "270px",
        backgroundColor: "#FFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #E0E0E0",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* -------------------- Top Section -------------------- */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={2}>
          <Image src={Logo} alt="Logo" width={60} height={45} style={{ aspectRatio: "4/3" }} />
        </Box>
      </Box>

      {/* -------------------- Scrollable Middle Section -------------------- */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 2,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#3EA3FF",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        {/* -------- Main Menu -------- */}
        <List>
          {menuItems.map((item) => {
            const isSelected = selected === item.label;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => setSelected(item.label)}
                sx={{
                  borderRadius: "8px",
                  pl: "8px",
                  color: isSelected ? "#FFF" : "#000",
                  backgroundColor: isSelected ? "#3EA3FF" : "transparent",
                  position: "relative",
                  "&:hover": {
                    backgroundColor: isSelected
                      ? "#3EA3FF"
                      : "rgba(62,163,255,0.1)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: "-10px",
                    top: 0,
                    height: "100%",
                    width: isSelected ? "4px" : "0px",
                    backgroundColor: "#3EA3FF",
                    borderRadius: "0 4px 4px 0",
                    transition: "width 0.2s ease",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "32px",
                    "& svg": {
                      width: 20,
                      height: 20,
                      transition: "filter 0.2s ease",
                      filter: getIconFilter(item.label, isSelected),
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "14px",
                    letterSpacing: "0.3px",
                    color: isSelected ? "#FFF" : "#000",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ my: 1, mx: "-16px", borderColor: "#E0E0E0" }} />

        {/* -------- Document Generation -------- */}
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography
            sx={{
              color: "#202224",
              opacity: 0.6,
              fontSize: "12px",
              letterSpacing: "0.257px",
            }}
          >
            Document Generation
          </Typography>
          <IconButton size="small" sx={{ color: "#202224", opacity: 0.6 }}>
            <AddIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Box>

        <List>
          {documentItems.map((item) => {
            const isSelected = selected === item.label;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => setSelected(item.label)}
                sx={{
                  borderRadius: "8px",
                  pl: "8px",
                  color: isSelected ? "#FFF" : "#000",
                  backgroundColor: isSelected ? "#3EA3FF" : "transparent",
                  position: "relative",
                  "&:hover": {
                    backgroundColor: isSelected
                      ? "#3EA3FF"
                      : "rgba(62,163,255,0.1)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: "-10px",
                    top: 0,
                    height: "100%",
                    width: isSelected ? "4px" : "0px",
                    backgroundColor: "#3EA3FF",
                    borderRadius: "0 4px 4px 0",
                    transition: "width 0.2s ease",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "32px",
                    "& svg": {
                      width: 20,
                      height: 20,
                      transition: "filter 0.2s ease",
                      filter: getIconFilter(item.label, isSelected),
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "14px",
                    letterSpacing: "0.3px",
                    color: isSelected ? "#FFF" : "#000",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ my: 1, mx: "-16px", borderColor: "#E0E0E0" }} />

        {/* -------- Tools -------- */}
        <Typography
          sx={{
            color: "#202224",
            opacity: 0.6,
            fontSize: "12px",
            letterSpacing: "0.257px",
            mb: 1,
          }}
        >
          Tools
        </Typography>

        <List>
          {toolItems.map((item) => {
            const isSelected = selected === item.label;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => setSelected(item.label)}
                sx={{
                  borderRadius: "8px",
                  pl: "8px",
                  color: isSelected ? "#FFF" : "#000",
                  backgroundColor: isSelected ? "#3EA3FF" : "transparent",
                  position: "relative",
                  "&:hover": {
                    backgroundColor: isSelected
                      ? "#3EA3FF"
                      : "rgba(62,163,255,0.1)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: "-10px",
                    top: 0,
                    height: "100%",
                    width: isSelected ? "4px" : "0px",
                    backgroundColor: "#3EA3FF",
                    borderRadius: "0 4px 4px 0",
                    transition: "width 0.2s ease",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "32px",
                    "& svg": {
                      width: 20,
                      height: 20,
                      transition: "filter 0.2s ease",
                      filter: getIconFilter(item.label, isSelected),
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "14px",
                    letterSpacing: "0.3px",
                    color: isSelected ? "#FFF" : "#000",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* -------------------- Bottom Section -------------------- */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #E0E0E0",
          flexShrink: 0,
        }}
      >
        <Avatar sx={{ width: 36, height: 36, mr: 1.5 }} />
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
            Kavtech Solution
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#555", opacity: 0.7 }}>
            Basic Plan
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;