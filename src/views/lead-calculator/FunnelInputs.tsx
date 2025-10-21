"use client";

import React from "react";
import { TextField, Card, CardContent, Typography, Box } from "@mui/material";

interface FunnelInputsProps {
  averageDealSize: number;
  setAverageDealSize: (value: number) => void;
  targetRevenue: number;
  setTargetRevenue: (value: number) => void;
  startingVolume: number;
  setStartingVolume: (value: number) => void;
}

const FunnelInputs: React.FC<FunnelInputsProps> = ({
  averageDealSize,
  setAverageDealSize,
  targetRevenue,
  setTargetRevenue,
  startingVolume,
  setStartingVolume,
}) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Global Inputs
        </Typography>

        {/* Responsive container replacing Grid */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={3}
          sx={{
            "& > *": {
              flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 16px)" }, // 3 per row on desktop
            },
          }}
        >
          <TextField
            fullWidth
            label="Average Deal Size ($)"
            type="number"
            value={averageDealSize}
            onChange={(e) => setAverageDealSize(parseFloat(e.target.value) || 0)}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Target Revenue ($)"
            type="number"
            value={targetRevenue}
            onChange={(e) => setTargetRevenue(parseFloat(e.target.value) || 0)}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Stage 1 Starting Volume"
            type="number"
            value={startingVolume}
            onChange={(e) => setStartingVolume(parseInt(e.target.value) || 0)}
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FunnelInputs;