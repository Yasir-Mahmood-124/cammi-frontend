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
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Stage Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Stage Volume</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Conversion to Next</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Values</TableCell>
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
                  <TableCell>
                    {row.stageName}: {row.stageVolume.toLocaleString()}
                  </TableCell>
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