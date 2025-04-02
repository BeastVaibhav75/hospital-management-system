import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Rating,
  Chip,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';

function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view appointments');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/all-appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAppointments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      // Convert UTC to local time
      const localDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST
      return localDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'booked':
        return 'primary';
      default:
        return 'default';
    }
  };

  const sortAppointments = (appointments) => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  const filterAppointments = (appointments) => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter(app => app.status.toLowerCase() === statusFilter);
  };

  const displayedAppointments = filterAppointments(sortAppointments(appointments));

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Manage Appointments
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By Date</InputLabel>
            <Select
              value={sortOrder}
              label="Sort By Date"
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Appointments</MenuItem>
              <MenuItem value="booked">Booked</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date & Time</strong></TableCell>
                <TableCell><strong>Patient</strong></TableCell>
                <TableCell><strong>Doctor</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Feedback</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{formatDateTime(appointment.date)}</TableCell>
                  <TableCell>
                    <Typography variant="body1">{appointment.patient?.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {appointment.patient?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">Dr. {appointment.doctor?.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {appointment.doctor?.specialization}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {appointment.status === 'completed' ? (
                      appointment.feedback ? (
                        <Stack spacing={1}>
                          <Rating
                            value={appointment.feedback.rating}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2" color="textSecondary">
                            {appointment.feedback.comment || 'No comment provided'}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No feedback yet
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not applicable
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default ManageAppointments; 