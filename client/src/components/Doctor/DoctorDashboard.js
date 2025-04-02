// client/src/components/Doctor/DoctorDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    fetchStats();
    fetchDoctorInfo();
  }, []);

  const fetchDoctorInfo = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.name) {
        setDoctorName(userInfo.name);
      }
    } catch (err) {
      console.error('Error fetching doctor info:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view dashboard');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/doctor/dashboard-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="dashboard-container">
      <Container>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <div className="greeting-section">
          <Typography variant="h4" className="greeting-text">
            {getGreeting()}, {doctorName}!
          </Typography>
          <Typography variant="subtitle1" className="greeting-subtitle">
            Welcome to your doctor dashboard
          </Typography>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/doctor/appointments')}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box className="icon-wrapper bg-primary">
                    <EventIcon className="dashboard-icon" />
                  </Box>
                  <Box ml={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Appointments
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalAppointments}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/doctor/today-appointments')}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box className="icon-wrapper bg-success">
                    <AccessTimeIcon className="dashboard-icon" />
                  </Box>
                  <Box ml={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Today's Appointments
                    </Typography>
                    <Typography variant="h4">
                      {stats.todayAppointments}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/doctor/patients')}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box className="icon-wrapper bg-info">
                    <PeopleIcon className="dashboard-icon" />
                  </Box>
                  <Box ml={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Patients
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalPatients}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default DoctorDashboard;
