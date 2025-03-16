// client/src/components/Admin/ViewStatistics.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ViewStatistics = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    appointmentsByMonth: [],
    doctorsBySpecialization: [],
    patientGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view statistics');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Stats response:', response.data);
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.response?.data?.message || 'Failed to fetch statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Chart data for appointments by month
  const appointmentsData = {
    labels: stats.appointmentsByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Appointments',
        data: stats.appointmentsByMonth?.map(item => item.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for doctors by specialization
  const doctorsData = {
    labels: stats.doctorsBySpecialization?.map(item => item.specialization) || [],
    datasets: [
      {
        data: stats.doctorsBySpecialization?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart data for patient growth
  const patientGrowthData = {
    labels: stats.patientGrowth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'New Patients',
        data: stats.patientGrowth?.map(item => item.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistics Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Statistics Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Patients</Typography>
            <Typography variant="h4">{stats.totalPatients}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Doctors</Typography>
            <Typography variant="h4">{stats.totalDoctors}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Appointments</Typography>
            <Typography variant="h4">{stats.totalAppointments}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Appointments by Month */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Appointments Trend
            </Typography>
            <Line data={appointmentsData} options={lineChartOptions} />
          </Paper>
        </Grid>

        {/* Doctors by Specialization */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Doctors by Specialization
            </Typography>
            <Pie data={doctorsData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Patient Growth */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Patient Growth Trend
            </Typography>
            <Line data={patientGrowthData} options={lineChartOptions} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ViewStatistics;
