// client/src/components/Patient/ProvideFeedback.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Rating,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';

function ProvideFeedback() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.id) {
          throw new Error('User information not found');
        }

        const response = await axios.get(
          `http://localhost:5000/api/appointments/patient/${userInfo.id}`,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.data) {
          throw new Error('No data received from server');
        }

        // Filter only completed appointments without feedback
        const eligibleAppointments = response.data.filter(app => 
          app.status === 'completed' && !app.feedback
        );
        setAppointments(eligibleAppointments);

        if (eligibleAppointments.length === 0) {
          setError('No completed appointments available for feedback');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch appointments. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) {
      setError('Please select an appointment');
      return;
    }
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axios.put(
        `http://localhost:5000/api/appointments/${selectedAppointmentId}/feedback`,
        {
          rating,
          comment
        },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess('Thank you for your feedback!');
      setRating(0);
      setComment('');
      setSelectedAppointmentId('');
      
      // Remove the appointment that just received feedback
      setAppointments(prev => prev.filter(app => app.id !== selectedAppointmentId));
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit feedback. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'PPpp'); // e.g., "Apr 29, 2023, 9:00 AM"
  };

  if (loading && appointments.length === 0) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          We Value Your Feedback
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
          Please share your experience about your completed appointments
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {appointments.length === 0 && !loading ? (
          <Alert severity="info">
            No completed appointments available for feedback
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Appointment</InputLabel>
              <Select
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                label="Select Appointment"
              >
                {appointments.map((appointment) => (
                  <MenuItem key={appointment.id} value={appointment.id}>
                    Dr. {appointment.doctor?.name} - {formatDateTime(appointment.date)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography component="legend" sx={{ mb: 1 }}>
                Rate your experience
              </Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Comments (Optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || !selectedAppointmentId || rating === 0}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Feedback'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default ProvideFeedback;
