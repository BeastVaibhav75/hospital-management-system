// client/src/components/Doctor/ViewAppointments.js
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
  TextField
} from '@mui/material';
import { format } from 'date-fns';

function ViewAppointments() {
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

  const getUserInfo = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = localStorage.getItem('token');
      return { userInfo, token };
    } catch (error) {
      console.error('Error parsing user info:', error);
      return { userInfo: null, token: null };
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view appointments');
        setTimeout(() => {
          navigate('/doctor/login', { state: { from: '/doctor/appointments' } });
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/doctor/appointments`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data) {
          setAppointments(response.data);
          setError('');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setTimeout(() => {
            navigate('/doctor/login', { state: { from: '/doctor/appointments' } });
          }, 2000);
        } else {
          setError('Failed to fetch appointments. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const handleComplete = async (appointmentId) => {
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

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy hh:mm a');
    } catch (error) {
      return 'Invalid Date';
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
        <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
          All Appointments
        </Typography>

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
          <Alert severity="info">No appointments found.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{formatDateTime(appointment.date)}</TableCell>
                    <TableCell>{appointment.patient.name}</TableCell>
                    <TableCell>
                      {appointment.patient.phone}<br/>
                      {appointment.patient.email}
                    </TableCell>
                    <TableCell>{appointment.status}</TableCell>
                    <TableCell>
                      {appointment.status === 'booked' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleComplete(appointment.id)}
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

export default ViewAppointments;
