"use client";

import React, { useState, useMemo } from "react";
import { Container, Typography, Box } from "@mui/material";
import FunnelInputs from "./FunnelInputs";
import StagesTable from "./StagesTable";
import ForwardResults from "./ForwardResults";
import ReverseResults from "./ReverseResults";
import Charts from "./Charts";
import { Stage, forwardCalc, reverseCalc } from "@/utils/calculations";

const DEFAULT_STAGES: Stage[] = [
  { name: "Website Visitors + Database", conversion: null },
  { name: "Leads", conversion: 2 },
  { name: "Marketing Qualified Lead (MQL)", conversion: 35 },
  { name: "Sales Qualified Lead (SQL)", conversion: 45 },
  { name: "Opportunity", conversion: 80 },
  { name: "Proposal", conversion: 70 },
  { name: "Customer", conversion: 25 },
];

export default function Home() {
  const [averageDealSize, setAverageDealSize] = useState<number>(15000);
  const [targetRevenue, setTargetRevenue] = useState<number>(500000);
  const [startingVolume, setStartingVolume] = useState<number>(20000);
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);

  const forwardCalculation = useMemo(() => {
    return forwardCalc(stages, startingVolume, averageDealSize);
  }, [stages, startingVolume, averageDealSize]);

  const reverseCalculation = useMemo(() => {
    return reverseCalc(stages, targetRevenue, averageDealSize);
  }, [stages, targetRevenue, averageDealSize]);

  return (
    <Box sx={{ backgroundColor: "#F8F9FA", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: 700,
            color: "#1E1548",
            fontSize: "28px",
          }}
        >
          Lead Calculator
        </Typography>

        <FunnelInputs
          averageDealSize={averageDealSize}
          setAverageDealSize={setAverageDealSize}
          targetRevenue={targetRevenue}
          setTargetRevenue={setTargetRevenue}
          startingVolume={startingVolume}
          setStartingVolume={setStartingVolume}
        />

        {/* Two-column responsive layout replacing Grid */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={3}
          sx={{
            mb: 4,
            "& > *": {
              flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" }, // 1 per row on mobile, 2 per row on desktop
            },
          }}
        >
          <StagesTable stages={stages} setStages={setStages} />
          <ForwardResults results={forwardCalculation.results} />
        </Box>

        <ReverseResults results={reverseCalculation.results} />

        <Charts
          forwardResults={forwardCalculation.results}
          reverseResults={reverseCalculation.results}
        />
      </Container>
    </Box>
  );
}
