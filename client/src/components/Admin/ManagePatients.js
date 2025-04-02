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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPatients();
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formError]);

  const validateForm = () => {
    const errors = {};
    if (!newPatient.username.trim()) errors.username = 'Username is required';
    if (!newPatient.password.trim()) errors.password = 'Password is required';
    if (!newPatient.name.trim()) errors.name = 'Name is required';
    if (!newPatient.email.trim()) errors.email = 'Email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newPatient.email && !emailRegex.test(newPatient.email)) {
      errors.email = 'Invalid email format';
    }

    // Phone validation - only if phone is provided
    if (newPatient.phone.trim()) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(newPatient.phone)) {
        errors.phone = 'Phone number must be 10 digits';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access this page');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/patients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPatients(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (patient) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/admin/patients/${patient.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedPatient(response.data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError('Failed to fetch patient details');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to perform this action');
          return;
        }

        await axios.delete(
          `${process.env.REACT_APP_API_URL}/admin/patients/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccessMessage('Patient deleted successfully!');
        setError(null);
        fetchPatients();
      } catch (err) {
        console.error('Error deleting patient:', err);
        setError(err.response?.data?.message || 'Failed to delete patient');
        setSuccessMessage(null);
      }
    }
  };

  const handleAddPatient = async () => {
    try {
      setFormError(null);
      setSuccessMessage(null);
      setError(null);
      
      if (!validateForm()) {
        setFormError('Please fill in all required fields correctly');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setFormError('Please login to perform this action');
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/signup`,
        {
          ...newPatient,
          role: 'patient'
        }
      );
      setSuccessMessage('Patient added successfully!');
      setError(null);
      setAddDialogOpen(false);
      setNewPatient({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
      });
      setFormErrors({});
      fetchPatients();
    } catch (err) {
      console.error('Error adding patient:', err);
      setFormError(err.response?.data?.message || 'Failed to add patient');
      setSuccessMessage(null);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant="h4">Manage Patients</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setAddDialogOpen(true);
              setFormError(null);
              setSuccessMessage(null);
              setFormErrors({});
            }}
          >
            Add Patient
          </Button>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.username}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewPatient(patient)}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeletePatient(patient.id)}
                      title="Delete Patient"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Patient Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #e0e0e0',
          padding: '16px 24px'
        }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            Patient Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          {selectedPatient && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Name:</strong> {selectedPatient.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Email:</strong> {selectedPatient.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Phone:</strong> {selectedPatient.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Username:</strong> {selectedPatient.username}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Joined:</strong> {new Date(selectedPatient.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Appointment Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Total Appointments:</strong> {selectedPatient.totalAppointments || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Completed Appointments:</strong> {selectedPatient.completedAppointments || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Pending Appointments:</strong> {selectedPatient.pendingAppointments || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px 24px',
          borderTop: '2px solid #e0e0e0',
          backgroundColor: '#f5f5f5'
        }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Patient Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setFormError(null);
          setFormErrors({});
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Patient</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={newPatient.username}
                onChange={(e) => {
                  setNewPatient({ ...newPatient, username: e.target.value });
                  setFormErrors({ ...formErrors, username: '' });
                }}
                required
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newPatient.password}
                onChange={(e) => {
                  setNewPatient({ ...newPatient, password: e.target.value });
                  setFormErrors({ ...formErrors, password: '' });
                }}
                required
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={newPatient.name}
                onChange={(e) => {
                  setNewPatient({ ...newPatient, name: e.target.value });
                  setFormErrors({ ...formErrors, name: '' });
                }}
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newPatient.email}
                onChange={(e) => {
                  setNewPatient({ ...newPatient, email: e.target.value });
                  setFormErrors({ ...formErrors, email: '' });
                }}
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={newPatient.phone}
                onChange={(e) => {
                  setNewPatient({ ...newPatient, phone: e.target.value });
                  setFormErrors({ ...formErrors, phone: '' });
                }}
                required
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialogOpen(false);
            setFormError(null);
            setFormErrors({});
          }}>Cancel</Button>
          <Button onClick={handleAddPatient} variant="contained" color="primary">
            Add Patient
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ManagePatients; 