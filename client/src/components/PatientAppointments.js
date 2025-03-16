import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
}));

// Get user info from localStorage with better error handling
const getUserInfo = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    const tokenStr = localStorage.getItem('token');
    
    if (!userInfoStr || !tokenStr) {
      return { userInfo: null, token: null };
    }

    const userInfo = JSON.parse(userInfoStr);
    return { userInfo, token: tokenStr };
  } catch (error) {
    console.error('Error parsing user info:', error);
    return { userInfo: null, token: null };
  }
};

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authInfo] = useState(getUserInfo);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!authInfo.userInfo || !authInfo.token) {
        setError('Please log in to view appointments');
        setTimeout(() => {
          navigate('/patient/login', { state: { from: '/patient/appointments' } });
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/appointments/patient/${authInfo.userInfo.id}`, {
          headers: {
            'Authorization': `Bearer ${authInfo.token}`
          }
        });
        setAppointments(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('role');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            navigate('/patient/login', { state: { from: '/patient/appointments' } });
          }, 2000);
        } else {
          setError('Failed to fetch appointments');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [authInfo, navigate]);

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/appointments/cancel/${appointmentId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${authInfo.token}`
          }
        }
      );

      if (response.data.message) {
        setSuccess(response.data.message);
        // Update the appointments list
        setAppointments(appointments.filter(apt => apt.id !== appointmentId));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel appointment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      // Log the incoming date string for debugging
      console.log('Incoming date string:', dateString);
      
      // Split the date string into parts
      const [datePart, timePart] = dateString.split(' ');
      if (!datePart || !timePart) {
        console.error('Invalid date string format:', dateString);
        return 'Invalid Date';
      }

      // Split date into components
      const [year, month, day] = datePart.split('-');
      // Split time into components
      const [hour, minute] = timePart.split(':');

      // Create date object using local timezone
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // months are 0-based
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date components:', { year, month, day, hour, minute });
        return 'Invalid Date';
      }

      // Format the date
      return format(date, 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <Container maxWidth="lg">
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            My Appointments
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/patient/book-appointment')}
            sx={{ borderRadius: '8px' }}
          >
            Book New Appointment
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : appointments.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: '8px' }}>
            You don't have any appointments scheduled.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{formatDateTime(appointment.date)}</TableCell>
                    <TableCell>Dr. {appointment.doctor.name}</TableCell>
                    <TableCell>{appointment.doctor.specialization || 'General Medicine'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={appointment.status} 
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {appointment.status.toLowerCase() === 'scheduled' && (
                        <IconButton
                          color="error"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          size="small"
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledPaper>
    </Container>
  );
};

export default PatientAppointments; 