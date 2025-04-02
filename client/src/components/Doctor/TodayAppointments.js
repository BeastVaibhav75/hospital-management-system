import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import { format, isToday } from 'date-fns';

function TodayAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState({ appointment: '', medicalRecord: '' });
  const [medicalData, setMedicalData] = useState({
    diagnosis: '',
    prescriptions: '',
    testResults: ''
  });

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view appointments');
        setTimeout(() => {
          navigate('/doctor/login', { state: { from: '/doctor/today-appointments' } });
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/doctor/today-appointments`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data) {
          // Verify and sort today's appointments
          const todayAppointments = response.data.filter(appointment => 
            isToday(new Date(appointment.date))
          ).sort((a, b) => new Date(a.date) - new Date(b.date));
          
          setAppointments(todayAppointments);
          setError('');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setTimeout(() => {
            navigate('/doctor/login', { state: { from: '/doctor/today-appointments' } });
          }, 2000);
        } else {
          setError('Failed to fetch appointments. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAppointments();

    // Refresh appointments every minute
    const intervalId = setInterval(fetchTodayAppointments, 60000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const formatAppointmentTime = (dateString) => {
    try {
      const date = new Date(dateString);
      // Convert UTC to local time
      const localDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST
      return localDate.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const handleComplete = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
  };

  const handleSubmitMedicalRecord = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to update medical records');
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/doctor/appointments/close`,
        {
          appointmentId: selectedAppointmentId,
          ...medicalData
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update the appointment status locally
      setAppointments(prev =>
        prev.map(appt =>
          appt.id === selectedAppointmentId
            ? { ...appt, status: 'completed' }
            : appt
        )
      );

      // Show success messages
      setSuccessMessage({
        appointment: 'Appointment completed successfully!',
        medicalRecord: 'Medical records updated successfully!'
      });

      // Clear success messages after 5 seconds
      setTimeout(() => {
        setSuccessMessage({ appointment: '', medicalRecord: '' });
      }, 5000);

      // Reset form
      setSelectedAppointmentId(null);
      setMedicalData({
        diagnosis: '',
        prescriptions: '',
        testResults: ''
      });
    } catch (err) {
      console.error('Error updating medical record:', err);
      setError('Failed to update medical record. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
              Today's Appointments
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Box>
          <Chip 
            label={`${appointments.length} Appointment${appointments.length !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontSize: '1rem', py: 2, px: 1 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {successMessage.appointment && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage.appointment}
          </Alert>
        )}

        {successMessage.medicalRecord && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage.medicalRecord}
          </Alert>
        )}

        {appointments.length === 0 ? (
          <Alert severity="info" sx={{ fontSize: '1rem', py: 2 }}>
            No appointments scheduled for today.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="15%">Time</TableCell>
                  <TableCell width="25%">Patient Name</TableCell>
                  <TableCell width="30%">Contact</TableCell>
                  <TableCell width="15%">Status</TableCell>
                  <TableCell width="15%">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {formatAppointmentTime(appointment.date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {appointment.patient.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.patient.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.patient.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        color={appointment.status === 'completed' ? 'success' : 'primary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {appointment.status === 'booked' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleComplete(appointment.id)}
                          size="small"
                        >
                          Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog 
          open={Boolean(selectedAppointmentId)} 
          onClose={() => setSelectedAppointmentId(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Medical Record</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Diagnosis"
                value={medicalData.diagnosis}
                onChange={(e) => setMedicalData({ ...medicalData, diagnosis: e.target.value })}
                margin="normal"
                required
                helperText="Required - Enter the primary diagnosis"
              />
              <TextField
                fullWidth
                label="Prescriptions/Medications"
                value={medicalData.prescriptions}
                onChange={(e) => setMedicalData({ ...medicalData, prescriptions: e.target.value })}
                margin="normal"
                multiline
                rows={4}
                helperText="Enter prescribed medications, one per line"
              />
              <TextField
                fullWidth
                label="Test Results"
                value={medicalData.testResults}
                onChange={(e) => setMedicalData({ ...medicalData, testResults: e.target.value })}
                margin="normal"
                multiline
                rows={4}
                helperText="Enter any test results"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedAppointmentId(null)}>Cancel</Button>
            <Button onClick={handleSubmitMedicalRecord} variant="contained" color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default TodayAppointments; 