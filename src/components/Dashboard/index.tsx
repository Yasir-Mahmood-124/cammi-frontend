"use client";

import React from "react";
import Sidebar from "./Sidebar"; // adjust path if needed

const DashboardPage = () => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh", // full viewport height
        overflow: "hidden", // prevents scrollbar from appearing
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "270px",
          height: "100vh", // instead of fixed 1024px to avoid overflow
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </div>

      {/* Main Dashboard Content */}
      <main
        style={{
          flexGrow: 1,
          backgroundColor: "#F8F9FA",
          padding: "24px",
          overflowY: "auto", // scrolls only content area, not full page
          height: "100vh",
        }}
      >
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
      </main>
    </div>
  );
};

export default DashboardPage;
