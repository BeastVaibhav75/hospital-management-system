import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Rating,
  TextField
} from '@mui/material';
import { format } from 'date-fns';

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
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

        // Sort appointments by date (most recent first)
        const sortedAppointments = response.data.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );

        setAppointments(sortedAppointments);
        setError(null);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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

  const formatDateTime = (date) => {
    return format(new Date(date), 'PPpp'); // e.g., "Apr 29, 2023, 9:00 AM"
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    setCancelLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${selectedAppointment.id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the local state
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, status: 'cancelled' }
          : apt
      ));

      handleCancelClose();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('Failed to cancel appointment. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleFeedbackClick = (appointment) => {
    setSelectedAppointment(appointment);
    setFeedbackDialogOpen(true);
    setRating(0);
    setComment('');
  };

  const handleFeedbackClose = () => {
    setFeedbackDialogOpen(false);
    setSelectedAppointment(null);
    setRating(0);
    setComment('');
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedAppointment || rating === 0) return;

    setFeedbackLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${selectedAppointment.id}/feedback`,
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

      // Update the local state
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, feedback: { rating, comment } }
          : apt
      ));

      handleFeedbackClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          My Appointments
        </Typography>

        {appointments.length === 0 ? (
          <Alert severity="info">You have no appointments yet.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date & Time</strong></TableCell>
                  <TableCell><strong>Doctor</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{formatDateTime(appointment.date)}</TableCell>
                    <TableCell>{appointment.doctor?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={appointment.status || 'Unknown'} 
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {appointment.status === 'booked' && new Date(appointment.date) > new Date() && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancelClick(appointment)}
                        >
                          Cancel
                        </Button>
                      )}
                      {appointment.status === 'completed' && !appointment.feedback && (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleFeedbackClick(appointment)}
                        >
                          Give Feedback
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add the Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancel Appointment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment with Dr. {selectedAppointment?.doctor?.name} on {selectedAppointment && formatDateTime(selectedAppointment.date)}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} disabled={cancelLoading}>
            No, Keep It
          </Button>
          <Button 
            onClick={handleCancelConfirm} 
            color="error" 
            variant="contained"
            disabled={cancelLoading}
          >
            {cancelLoading ? 'Cancelling...' : 'Yes, Cancel It'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add the Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={handleFeedbackClose}
        aria-labelledby="feedback-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="feedback-dialog-title">
          Provide Feedback
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please rate your experience with Dr. {selectedAppointment?.doctor?.name} on {selectedAppointment && formatDateTime(selectedAppointment.date)}
          </DialogContentText>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
            sx={{ mb: 2 }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Additional Comments (Optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFeedbackClose} disabled={feedbackLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleFeedbackSubmit}
            color="primary"
            variant="contained"
            disabled={feedbackLoading || rating === 0}
          >
            {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PatientAppointments; 