// client/src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  EventNote as EventNoteIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    appointmentsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.name) {
        setAdminName(userInfo.name);
      }
    } catch (err) {
      console.error('Error fetching admin info:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view dashboard');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/stats`,
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
          <h1 className="greeting-text">
            {getGreeting()}, {adminName}!
          </h1>
          <p className="greeting-subtitle">Welcome to your hospital management dashboard</p>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <div className="dashboard-card">
              <div className="card-content">
                <div className="icon-wrapper bg-primary">
                  <HospitalIcon className="dashboard-icon" />
                </div>
                <div className="card-info">
                  <Typography className="card-subtitle">Total Doctors</Typography>
                  <Typography className="card-value">{stats.totalDoctors}</Typography>
                </div>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <div className="dashboard-card">
              <div className="card-content">
                <div className="icon-wrapper bg-success">
                  <PeopleIcon className="dashboard-icon" />
                </div>
                <div className="card-info">
                  <Typography className="card-subtitle">Total Patients</Typography>
                  <Typography className="card-value">{stats.totalPatients}</Typography>
                </div>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <div className="dashboard-card">
              <div className="card-content">
                <div className="icon-wrapper bg-warning">
                  <EventNoteIcon className="dashboard-icon" />
                </div>
                <div className="card-info">
                  <Typography className="card-subtitle">Total Appointments</Typography>
                  <Typography className="card-value">{stats.totalAppointments}</Typography>
                </div>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <div className="dashboard-card">
              <div className="card-content">
                <div className="icon-wrapper bg-info">
                  <EventNoteIcon className="dashboard-icon" />
                </div>
                <div className="card-info">
                  <Typography className="card-subtitle">Today's Appointments</Typography>
                  <Typography className="card-value">{stats.appointmentsToday}</Typography>
                </div>
              </div>
            </div>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <div className="quick-actions">
              <Typography variant="h5" sx={{ mb: 3 }}>Quick Actions</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <button
                    className="quick-action-button"
                    onClick={() => navigate('/admin/doctors')}
                  >
                    <PersonAddIcon /> Manage Doctors
                  </button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <button
                    className="quick-action-button"
                    onClick={() => navigate('/admin/patients')}
                  >
                    <PeopleIcon /> Manage Patients
                  </button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <button
                    className="quick-action-button"
                    onClick={() => navigate('/admin/statistics')}
                  >
                    <AssessmentIcon /> View Statistics
                  </button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <button
                    className="quick-action-button"
                    onClick={() => navigate('/admin/appointments')}
                  >
                    <CalendarMonthIcon /> Manage Appointments
                  </button>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default AdminDashboard;
