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
import { ForwardResult } from '@/utils/calculations';

interface ForwardResultsProps {
  results: ForwardResult[];
}

const ForwardResults: React.FC<ForwardResultsProps> = ({ results }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Forward Calculation
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Stage Name</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Stage Volume</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Conversion to Next</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.stageName}</TableCell>
                  <TableCell align="right">
                    {row.stageVolume.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{row.conversionToNext}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ForwardResults;