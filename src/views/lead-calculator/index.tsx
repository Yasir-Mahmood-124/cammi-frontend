"use client";

import React, { useState, useMemo } from "react";
import { Container, Typography, Box } from "@mui/material";
import FunnelInputs from "./FunnelInputs";
import StagesTable from "./StagesTable";
import ForwardResults from "./ForwardResults";
import ReverseResults from "./ReverseResults";
import Summary from "./Summary";
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
  const [calculationRun, setCalculationRun] = useState(false);

  const forwardCalculation = useMemo(() => {
    return calculationRun ? forwardCalc(stages, startingVolume, averageDealSize) : null;
  }, [stages, startingVolume, averageDealSize, calculationRun]);

  const reverseCalculation = useMemo(() => {
    return calculationRun ? reverseCalc(stages, targetRevenue, averageDealSize) : null;
  }, [stages, targetRevenue, averageDealSize, calculationRun]);

  // Calculate customers and revenue from the forward calculation results
  const customers = useMemo(() => {
    if (!forwardCalculation || !forwardCalculation.results || forwardCalculation.results.length === 0) {
      return 0;
    }
    // Get the last stage volume (customers)
    return forwardCalculation.results[forwardCalculation.results.length - 1].stageVolume;
  }, [forwardCalculation]);

  const totalRevenue = useMemo(() => {
    return customers * averageDealSize;
  }, [customers, averageDealSize]);

  const handleInputChange = (setter: any) => (value: number) => {
    setter(value);
    setCalculationRun(false);
  };

  const handleStagesChange = (newStages: Stage[]) => {
    setStages(newStages);
    setCalculationRun(false);
  };

  const runCalculation = () => {
    setCalculationRun(true);
  };

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
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          📊 Lead Funnel Calculator
        </Typography>

        <FunnelInputs
          averageDealSize={averageDealSize}
          setAverageDealSize={handleInputChange(setAverageDealSize)}
          targetRevenue={targetRevenue}
          setTargetRevenue={handleInputChange(setTargetRevenue)}
          startingVolume={startingVolume}
          setStartingVolume={handleInputChange(setStartingVolume)}
        />

        <StagesTable 
          stages={stages} 
          setStages={handleStagesChange}
          onRunCalculation={runCalculation}
        />

        {calculationRun && forwardCalculation && reverseCalculation && (
          <>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={3}
              sx={{
                mb: 4,
                "& > *": {
                  flex: { xs: "1 1 100%", lg: "1 1 calc(50% - 12px)" },
                },
              }}
            >
              <ForwardResults results={forwardCalculation.results} />
              <ReverseResults results={reverseCalculation.results} />
            </Box>

            <Summary
              averageDealSize={averageDealSize}
              customers={customers}
              revenue={totalRevenue}
            />

            <Charts
              forwardResults={forwardCalculation.results}
              reverseResults={reverseCalculation.results}
            />
          </>
        )}
      </Container>
    </Box>
  );
}