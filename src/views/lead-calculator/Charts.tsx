"use client";

import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ForwardResult, ReverseResult } from '@/utils/calculations';

interface ChartsProps {
  forwardResults: ForwardResult[];
  reverseResults: ReverseResult[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const Charts: React.FC<ChartsProps> = ({ forwardResults, reverseResults }) => {
  const chartData = forwardResults.map((r) => ({
    name: r.stageName.length > 20 ? r.stageName.substring(0, 20) + '...' : r.stageName,
    volume: r.stageVolume,
  }));

  const lossesData = forwardResults.slice(1).map((r, i) => ({
    name: r.stageName,
    loss: forwardResults[i].stageVolume - r.stageVolume,
  }));

  const comparisonData = forwardResults.map((r, i) => ({
    name: r.stageName.length > 20 ? r.stageName.substring(0, 20) + '...' : r.stageName,
    forward: r.stageVolume,
    reverse: reverseResults[i].requiredVolume,
  }));

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
        Visualizations
      </Typography>

      <Grid container spacing={3}>
        {/* Forward Funnel Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Forward Funnel (Bar Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" fill="#8884d8" name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Conversion Drop-off Line Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversion Drop-off (Line Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Volume"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Losses Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Losses by Stage (Pie Chart)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lossesData}
                    dataKey="loss"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {lossesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Forward vs Reverse Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Forward vs Reverse Required
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="forward" fill="#8884d8" name="Forward" />
                  <Bar dataKey="reverse" fill="#82ca9d" name="Reverse Required" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Charts;