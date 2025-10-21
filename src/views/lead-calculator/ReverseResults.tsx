"use client";

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ReverseResult } from '@/utils/calculations';

interface ReverseResultsProps {
  results: ReverseResult[];
}

const ReverseResults: React.FC<ReverseResultsProps> = ({ results }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Reverse Calculation
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Stage Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Required Volume</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Cumulative Required Conversion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.stageName}</TableCell>
                  <TableCell align="right">
                    {row.requiredVolume.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{row.cumulativeConversion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ReverseResults;