"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Dashboard/Sidebar";
import TopBar from "./TopBar";
import { Box } from "@mui/material";

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box 
      sx={{ 
        display: "flex", 
        height: "100vh", 
        width: "100%",
        overflow: "hidden"
      }}
    >
      {/* Sidebar - dynamic width */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content area with TopBar */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: isCollapsed ? "calc(100% - 70px)" : "calc(100% - 270px)",
          transition: "margin-left 0.3s ease, width 0.3s ease",
        }}
      >
        {/* TopBar - fixed at top */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <TopBar />
        </Box>

        {/* Scrollable content area */}
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#EFF1F5",
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}