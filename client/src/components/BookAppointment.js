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
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
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

const BookAppointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [authInfo] = useState(getUserInfo);

  // Check if user is logged in and fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!authInfo.userInfo || !authInfo.token) {
        setError('Please log in to book an appointment');
        setTimeout(() => {
          navigate('/patient/login', { state: { from: '/patient/book-appointment' } });
        }, 2000);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/users/doctors', {
          headers: {
            'Authorization': `Bearer ${authInfo.token}`
          }
        });
        setDoctors(response.data);
        
        // Extract and set unique specializations
        const uniqueSpecializations = Array.from(new Set(
          response.data
            .filter(doctor => doctor.specialization || 'General Medicine')
            .map(doctor => doctor.specialization || 'General Medicine')
        )).sort();
        
        setSpecializations(uniqueSpecializations);
        // Initialize with empty selection
        setSelectedSpecialization('');
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('role');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            navigate('/patient/login', { state: { from: '/patient/book-appointment' } });
          }, 2000);
        }
      }
    };

    fetchDoctors();
  }, []); // Run only once on component mount

  // Filter doctors based on selected specialization
  const filteredDoctors = selectedSpecialization
    ? doctors.filter(doctor => doctor.specialization === selectedSpecialization)
    : doctors;

  // Handle specialization change
  const handleSpecializationChange = (event) => {
    setSelectedSpecialization(event.target.value);
    setSelectedDoctor(''); // Reset selected doctor when specialization changes
    setSelectedDate(null); // Reset date
    setSelectedSlot(null); // Reset time slot
    setAvailableSlots([]); // Reset available slots
  };

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
              'Authorization': `Bearer ${authInfo.token}`
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

    if (selectedDoctor && selectedDate && authInfo.userInfo && authInfo.token) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate, authInfo, navigate]);

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
    if (!authInfo.userInfo || !authInfo.token) {
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
      // Create a new date object with the selected date and time
      const appointmentDateTime = new Date(selectedDate);
      const selectedTime = new Date(selectedSlot);
      
      // Set the time components
      appointmentDateTime.setHours(selectedTime.getHours());
      appointmentDateTime.setMinutes(selectedTime.getMinutes());
      appointmentDateTime.setSeconds(0);
      appointmentDateTime.setMilliseconds(0);

      const response = await axios.post('http://localhost:5000/api/appointments/book', {
        doctorId: selectedDoctor,
        patientId: authInfo.userInfo.id,
        date: appointmentDateTime.toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authInfo.token}`
        }
      });

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
          {/* Specialization Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel sx={{ 
                backgroundColor: 'white',
                px: 1
              }}>Select Department</InputLabel>
              <Select
                value={selectedSpecialization}
                onChange={handleSpecializationChange}
                sx={{ borderRadius: '8px' }}
                label="Select Department"
              >
                <MenuItem value="">
                  <em>Select a department</em>
                </MenuItem>
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Doctor Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel sx={{ 
                backgroundColor: 'white',
                px: 1
              }}>Select Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                sx={{ borderRadius: '8px' }}
                label="Select Doctor"
              >
                <MenuItem value="">
                  <em>{!selectedSpecialization ? 'Please select a department first' : 'Choose a doctor'}</em>
                </MenuItem>
                {selectedSpecialization && filteredDoctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} - {doctor.specialization || 'General Medicine'}
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
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2, 
                    color: 'text.secondary',
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}
                >
                  Hospital Appointment Hours: 9:00 AM - 4:00 PM
                </Typography>
                {error && error.includes('hospital appointment hours') && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 2,
                      borderRadius: '8px',
                      position: 'relative',
                      zIndex: 9999
                    }}
                  >
                    {error}
                  </Alert>
                )}
              </Box>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MobileTimePicker
                  label="Select Time"
                  value={selectedSlot}
                  onChange={(newTime) => {
                    if (!newTime) return;
                    const hours = newTime.getHours();
                    if (hours < 9 || hours >= 16) {
                      setError('Selected time is outside hospital appointment hours (9:00 AM - 4:00 PM)');
                    } else {
                      setError(''); // Only clear the error if a valid time is selected
                    }
                    setSelectedSlot(newTime);
                  }}
                  disabled={loading}
                  ampm={true}
                  orientation="portrait"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px'
                        }
                      }
                    },
                    toolbar: {
                      sx: {
                        backgroundColor: '#1976d2',
                        color: 'white',
                        '& .MuiTypography-root': {
                          color: 'white'
                        },
                        '& .MuiButtonBase-root': {
                          color: 'white'
                        }
                      }
                    },
                    mobilePaper: {
                      sx: {
                        '& .MuiPickersLayout-contentWrapper': {
                          backgroundColor: 'white'
                        },
                        '& .MuiClock-clock': {
                          backgroundColor: '#f5f5f5'
                        },
                        '& .MuiClock-pin': {
                          backgroundColor: '#1976d2'
                        },
                        '& .MuiClockPointer-root': {
                          backgroundColor: '#1976d2',
                          '& .MuiClockPointer-thumb': {
                            backgroundColor: '#1976d2',
                            border: '2px solid #1976d2'
                          }
                        },
                        '& .MuiClockNumber-root.Mui-selected': {
                          backgroundColor: '#1976d2'
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
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