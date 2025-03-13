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
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';

function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.id) {
          throw new Error('User information not found');
        }

        const response = await axios.get(
          `http://localhost:5000/api/patients/${userInfo.id}/medical-history`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        // Sort records by date (most recent first)
        const sortedRecords = response.data.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );

        setRecords(sortedRecords);
        setError(null);
      } catch (error) {
        console.error('Error fetching medical history:', error);
        setError('Failed to load medical history');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

  const formatDate = (date) => {
    return format(new Date(date), 'PPP'); // e.g., "April 29, 2023"
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
          Medical History
        </Typography>

        {records.length === 0 ? (
          <Alert severity="info">No medical records found.</Alert>
        ) : (
          records.map((record) => (
            <Accordion key={record._id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <strong>{formatDate(record.date)}</strong> - Dr. {record.doctor.name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '200px' }}>
                          <strong>Diagnosis</strong>
                        </TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <strong>Symptoms</strong>
                        </TableCell>
                        <TableCell>{record.symptoms}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          <strong>Prescribed Medications</strong>
                        </TableCell>
                        <TableCell>
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {record.medications.map((med, index) => (
                              <li key={index}>
                                {med.name} - {med.dosage} ({med.frequency})
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                      {record.notes && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <strong>Additional Notes</strong>
                          </TableCell>
                          <TableCell>{record.notes}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Paper>
    </Container>
  );
}

export default MedicalHistory; 