// client/src/components/Patient/ProvideFeedback.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import './ProvideFeedback.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ProvideFeedback() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [feedback, setFeedback] = useState('');
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
          `${API_URL}/appointments/patient/${userInfo.id}`,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.data) {
          throw new Error('No data received from server');
        }

        // Filter only completed appointments
        const completedAppointments = response.data.filter(app => app.status === 'completed');
        setAppointments(completedAppointments);

        if (completedAppointments.length === 0) {
          setError('No completed appointments found');
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

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) {
      setError('Please select an appointment');
      return;
    }
    if (!feedback.trim()) {
      setError('Please enter your feedback');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axios.post(
        `${API_URL}/appointments/${selectedAppointmentId}/feedback`,
        { feedback },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess('Thank you for your feedback!');
      setFeedback('');
      setSelectedAppointmentId('');
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

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && appointments.length === 0) {
    return (
      <Container className="feedback-container d-flex justify-content-center align-items-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading appointments...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="feedback-container">
      <Card className="feedback-card">
        <Card.Body>
          <div className="feedback-header">
            <h2>We Value Your Feedback</h2>
            <p className="text-muted">
              Please share your experience about your completed appointments
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Form onSubmit={submitFeedback}>
            <Form.Group className="mb-4">
              <Form.Label>Select Appointment</Form.Label>
              <Form.Select
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                disabled={loading || appointments.length === 0}
              >
                <option value="">Choose an appointment...</option>
                {appointments.map((app) => (
                  <option key={app.id} value={app.id}>
                    {formatDate(app.date)} - Dr. {app.doctor?.name || 'Unknown'}
                  </option>
                ))}
              </Form.Select>
              {appointments.length === 0 && !loading && (
                <Form.Text className="text-muted">
                  No completed appointments available for feedback
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Your Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Please share your experience with us..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={loading || !selectedAppointmentId}
              />
            </Form.Group>

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !selectedAppointmentId || !feedback.trim()}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="me-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ProvideFeedback;
