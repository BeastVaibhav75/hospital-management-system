import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/material/styles';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
}));

const TimeSlotButton = styled(Button)(({ theme, selected }) => ({
  minWidth: '120px',
  margin: '8px',
  borderRadius: '25px',
  transition: 'all 0.3s ease',
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected ? 'white' : theme.palette.primary.main,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }
}));

const BookAppointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Get user info from localStorage with better error handling
  const getUserInfo = () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const tokenStr = localStorage.getItem('token');
      console.log('Raw localStorage data:', { userInfoStr, tokenStr });
      
      if (!userInfoStr || !tokenStr) {
        console.log('Missing user info or token');
        return { userInfo: null, token: null };
      }

      const userInfo = JSON.parse(userInfoStr);
      console.log('Parsed user info:', userInfo);
      
      return { userInfo, token: tokenStr };
    } catch (error) {
      console.error('Error parsing user info:', error);
      return { userInfo: null, token: null };
    }
  };

  const { userInfo, token } = getUserInfo();

  // Check if user is logged in
  useEffect(() => {
    console.log('Checking login state:', { 
      hasUserInfo: !!userInfo, 
      hasToken: !!token,
      userInfoDetails: userInfo
    });

    if (!userInfo || !token) {
      console.log('User not logged in, redirecting to login');
      setError('Please log in to book an appointment');
      setTimeout(() => {
        navigate('/patient/login', { state: { from: '/patient/book-appointment' } });
      }, 2000);
      return;
    }

    // Verify token by making a request to a protected endpoint
    const verifyToken = async () => {
      try {
        // Use the doctors endpoint to verify token validity
        const response = await axios.get('http://localhost:5000/api/users/doctors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Token verification successful');
        // If we get here, the token is valid
        setDoctors(response.data); // We can use this data directly
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('role');
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          navigate('/patient/login', { state: { from: '/patient/book-appointment' } });
        }, 2000);
      }
    };

    verifyToken();
  }, [userInfo, token, navigate]);

  // Remove the separate doctors fetch since we're getting it from token verification
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/users/doctors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setDoctors(response.data);
      } catch (error) {
        setError('Failed to fetch doctors list');
        if (error.response?.status === 401) {
          setTimeout(() => {
            navigate('/patient/login', { state: { from: '/patient/book-appointment' } });
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userInfo && token) {
      fetchDoctors();
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedDoctor && selectedDate) {
        setLoadingSlots(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/appointments/available-slots`, {
            params: {
              doctorId: selectedDoctor,
              date: selectedDate.toISOString()
            },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setAvailableSlots(response.data.availableSlots);
        } catch (error) {
          setError('Failed to fetch available slots');
          if (error.response?.status === 401) {
            setTimeout(() => {
              navigate('/patient/login', { state: { from: '/patient/book-appointment' } });
            }, 2000);
          }
        } finally {
          setLoadingSlots(false);
        }
      }
    };

    if (selectedDoctor && selectedDate && userInfo && token) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate, token, navigate]);

  const handleDateChange = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      setError('Please select a future date');
      return;
    }

    const day = date.getDay();
    if (day === 0 || day === 6) { // Sunday (0) or Saturday (6)
      setError('Appointments are only available Monday to Friday');
      return;
    }

    setError('');
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBookAppointment = async () => {
    if (!userInfo || !token) {
      setError('Please log in to book an appointment');
      setTimeout(() => {
        navigate('/patient/login', { state: { from: '/patient/book-appointment' } });
      }, 2000);
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setError('Please select all required fields');
      return;
    }

    setLoading(true);
    try {
      const appointmentDate = new Date(selectedDate);
      const slotTime = new Date(selectedSlot);
      appointmentDate.setHours(slotTime.getHours(), 0, 0, 0);

      // Debug logs
      console.log('Booking appointment with data:', {
        doctorId: selectedDoctor,
        patientId: userInfo.id,
        date: appointmentDate.toISOString(),
        userInfo: userInfo
      });

      console.log('Using token:', token);

      const response = await axios.post('http://localhost:5000/api/appointments/book', {
        doctorId: selectedDoctor,
        patientId: userInfo.id,
        date: appointmentDate.toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Appointment response:', response.data);

      if (response.data.message) {
        setSuccess(response.data.message);
        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Appointment booking error:', error.response || error);
      setError(error.response?.data?.message || 'Failed to book appointment');
      if (error.response?.status === 401) {
        setTimeout(() => {
          navigate('/patient/login', { state: { from: '/patient/book-appointment' } });
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Container maxWidth="md">
      <StyledPaper>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 4 }}>
          Book Appointment
        </Typography>

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

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Select Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={loading}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
                minDate={new Date()}
                shouldDisableDate={(date) => {
                  const day = date.getDay();
                  return day === 0 || day === 6; // Disable weekends
                }}
              />
            </LocalizationProvider>
          </Grid>

          {selectedDate && selectedDoctor && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                Available Time Slots
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {loadingSlots ? (
                  <CircularProgress />
                ) : availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <TimeSlotButton
                      key={slot}
                      selected={selectedSlot === slot}
                      onClick={() => setSelectedSlot(slot)}
                      variant={selectedSlot === slot ? "contained" : "outlined"}
                      disabled={loading}
                    >
                      {formatTimeSlot(slot)}
                    </TimeSlotButton>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No available slots for this date
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleBookAppointment}
              disabled={!selectedDoctor || !selectedDate || !selectedSlot || loading}
              sx={{
                py: 2,
                borderRadius: '8px',
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Book Appointment'}
            </Button>
          </Grid>
        </Grid>
      </StyledPaper>
    </Container>
  );
};

export default BookAppointment; 