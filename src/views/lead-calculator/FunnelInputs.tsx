"use client";

import React from 'react';
import { TextField, Grid, Card, CardContent, Typography } from '@mui/material';

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
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Average Deal Size ($)"
              type="number"
              value={averageDealSize}
              onChange={(e) => setAverageDealSize(parseFloat(e.target.value) || 0)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Target Revenue ($)"
              type="number"
              value={targetRevenue}
              onChange={(e) => setTargetRevenue(parseFloat(e.target.value) || 0)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Stage 1 Starting Volume"
              type="number"
              value={startingVolume}
              onChange={(e) => setStartingVolume(parseInt(e.target.value) || 0)}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FunnelInputs;