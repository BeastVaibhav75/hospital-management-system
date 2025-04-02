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

function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDoctors();
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

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/doctors`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setDoctors(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoctor = async (doctor) => {
    try {
      // Fetch fresh data for the selected doctor
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/doctors`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      // Find the updated doctor data
      const updatedDoctor = response.data.find(d => d.id === doctor.id);
      if (updatedDoctor) {
        setSelectedDoctor(updatedDoctor);
        setViewDialogOpen(true);
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      setError('Failed to load doctor details');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to perform this action');
          return;
        }

        await axios.delete(
          `${process.env.REACT_APP_API_URL}/admin/doctors/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccessMessage('Doctor deleted successfully!');
        setError(null);
        fetchDoctors();
      } catch (err) {
        console.error('Error deleting doctor:', err);
        setError(err.response?.data?.message || 'Failed to delete doctor');
        setSuccessMessage(null);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newDoctor.username.trim()) errors.username = 'Username is required';
    if (!newDoctor.password.trim()) errors.password = 'Password is required';
    if (!newDoctor.name.trim()) errors.name = 'Name is required';
    if (!newDoctor.email.trim()) errors.email = 'Email is required';
    if (!newDoctor.specialization.trim()) errors.specialization = 'Specialization is required';
    if (!newDoctor.experience) errors.experience = 'Experience is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newDoctor.email && !emailRegex.test(newDoctor.email)) {
      errors.email = 'Invalid email format';
    }

    // Experience validation
    if (newDoctor.experience) {
      const expValue = parseInt(newDoctor.experience);
      if (isNaN(expValue) || expValue < 0 || expValue > 50) {
        errors.experience = 'Experience must be between 0 and 50 years';
      }
    }

    // Phone validation - only if phone is provided
    if (newDoctor.phone.trim()) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(newDoctor.phone)) {
        errors.phone = 'Phone number must be 10 digits';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDoctor = async () => {
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

      // Convert experience to number
      const doctorData = {
        ...newDoctor,
        experience: parseInt(newDoctor.experience),
        role: 'doctor'
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/doctors`,
        doctorData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      setSuccessMessage('Doctor added successfully!');
      setError(null);
      setAddDialogOpen(false);
      setNewDoctor({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience: ''
      });
      setFormErrors({});
      fetchDoctors();
    } catch (err) {
      console.error('Error adding doctor:', err);
      setFormError(err.response?.data?.message || 'Failed to add doctor');
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
          <Typography variant="h4">Manage Doctors</Typography>
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
            Add Doctor
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
                <TableCell>Specialization</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.experience} years</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.phone}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDoctor(doctor)}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      title="Delete Doctor"
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

      {/* View Doctor Details Dialog */}
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
            Doctor Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          {selectedDoctor && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Name:</strong> {selectedDoctor.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Specialization:</strong> {selectedDoctor.specialization}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Experience:</strong> {selectedDoctor.experience} years
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Email:</strong> {selectedDoctor.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Phone:</strong> {selectedDoctor.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Username:</strong> {selectedDoctor.username}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Joined:</strong> {new Date(selectedDoctor.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Patients Today:</strong> {selectedDoctor.patientsToday || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Total Patients:</strong> {selectedDoctor.totalPatients || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Appointments Today:</strong> {selectedDoctor.appointmentsToday || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        <strong style={{ color: '#666' }}>Total Appointments:</strong> {selectedDoctor.totalAppointments || 0}
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

      {/* Add Doctor Dialog */}
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
        <DialogTitle>Add New Doctor</DialogTitle>
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
                value={newDoctor.username}
                onChange={(e) => {
                  setNewDoctor({ ...newDoctor, username: e.target.value });
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
                value={newDoctor.password}
                onChange={(e) => {
                  setNewDoctor({ ...newDoctor, password: e.target.value });
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
                value={newDoctor.name}
                onChange={(e) => {
                  setNewDoctor({ ...newDoctor, name: e.target.value });
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
                value={newDoctor.email}
                onChange={(e) => {
                  setNewDoctor({ ...newDoctor, email: e.target.value });
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
                value={newDoctor.phone}
                onChange={(e) => {
                  setNewDoctor({ ...newDoctor, phone: e.target.value });
                  setFormErrors({ ...formErrors, phone: '' });
                }}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specialization"
                value={newDoctor.specialization}
                onChange={(e) => {
                  setNewDoctor({ ...newDoctor, specialization: e.target.value });
                  setFormErrors({ ...formErrors, specialization: '' });
                }}
                required
                error={!!formErrors.specialization}
                helperText={formErrors.specialization}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Experience (years)"
                type="number"
                value={newDoctor.experience}
                onChange={(e) => {
                  setNewDoctor({ ...newDoctor, experience: e.target.value });
                  setFormErrors({ ...formErrors, experience: '' });
                }}
                required
                error={!!formErrors.experience}
                helperText={formErrors.experience}
                inputProps={{ min: 0, max: 50 }}
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
          <Button onClick={handleAddDoctor} variant="contained" color="primary">
            Add Doctor
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ManageDoctors; 