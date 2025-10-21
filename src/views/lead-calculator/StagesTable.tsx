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
  TextField,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Stage } from '@/utils/calculations';

interface StagesTableProps {
  stages: Stage[];
  setStages: (stages: Stage[]) => void;
  onRunCalculation: () => void;
}

const StagesTable: React.FC<StagesTableProps> = ({ stages, setStages, onRunCalculation }) => {
  const addStage = () => {
    setStages([...stages, { name: 'New Stage', conversion: 50 }]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      setStages(stages.filter((_, i) => i !== index));
    }
  };

  const updateStageName = (index: number, name: string) => {
    const updated = [...stages];
    updated[index].name = name;
    setStages(updated);
  };

  const updateStageConversion = (index: number, value: string) => {
    const updated = [...stages];
    const parsed = parseFloat(value);
    updated[index].conversion = isNaN(parsed) ? null : parsed;
    setStages(updated);
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Funnel Stages
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Stage Name</TableCell>
                <TableCell>Conversion to Next (%)</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stages.map((stage, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      value={stage.name}
                      onChange={(e) => updateStageName(index, e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={stage.conversion || ''}
                      onChange={(e) => updateStageConversion(index, e.target.value)}
                      placeholder="0-100"
                      disabled={index === 0}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => removeStage(index)}
                      disabled={stages.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addStage}
          >
            Add Stage
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={onRunCalculation}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Run Calculation
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StagesTable;