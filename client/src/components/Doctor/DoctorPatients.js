import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Box,
  Chip,
  Rating,
  Tooltip
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';

function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/doctor/patients`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatients(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to fetch patients data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'booked':
        return 'primary';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>
          My Patients
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {patients.length === 0 ? (
          <Alert severity="info">No patients found.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Patient Name</strong></TableCell>
                  <TableCell><strong>Last Visit</strong></TableCell>
                  <TableCell><strong>Total Visits</strong></TableCell>
                  <TableCell><strong>Feedback</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <Typography variant="body1">{patient.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {patient.email}<br/>{patient.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>{patient.lastVisit ? formatDateTime(patient.lastVisit) : 'No visits yet'}</TableCell>
                    <TableCell>{patient.totalVisits || 0}</TableCell>
                    <TableCell>
                      {patient.feedback ? (
                        <Box>
                          <Rating 
                            value={Number(patient.feedback.rating)} 
                            readOnly 
                            size="small"
                          />
                          {patient.feedback.comment && (
                            <Tooltip title={patient.feedback.comment}>
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                {patient.feedback.comment.length > 50 ? 
                                  `${patient.feedback.comment.substring(0, 50)}...` : 
                                  patient.feedback.comment
                                }
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">No feedback yet</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

export default DoctorPatients; 