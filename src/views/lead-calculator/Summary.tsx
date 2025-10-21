"use client";

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface SummaryProps {
  averageDealSize: number;
  customers: number;
  revenue: number;
}

const Summary: React.FC<SummaryProps> = ({ averageDealSize, customers, revenue }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Summary
        </Typography>
        <Box
          display="flex"
          flexWrap="wrap"
          gap={4}
          sx={{
            "& > *": {
              flex: { xs: "1 1 100%", md: "1 1 calc(33.333% - 21px)" },
            },
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Average Deal Size
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              ${averageDealSize.toLocaleString()}.00
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customers per Period
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {customers}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Revenue Estimate
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              ${revenue.toLocaleString()}.00
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Summary;