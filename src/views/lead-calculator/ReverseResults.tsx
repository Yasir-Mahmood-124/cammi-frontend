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
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Stage Name</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Required Volume</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Cumulative Conv.</strong>
                </TableCell>
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