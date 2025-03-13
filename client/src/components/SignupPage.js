// client/src/components/SignupPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Avatar,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error message when user starts typing
    if (errorMessage) setErrorMessage('');
  };

  const validateForm = () => {
    if (!formData.username) return 'Username is required';
    if (!formData.password) return 'Password is required';
    if (!formData.name) return 'Name is required';
    if (!formData.email) return 'Email is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters long';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone)) return 'Invalid phone number format';
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Clear previous error
    setErrorMessage('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      // Create a copy of formData and handle empty phone number
      const signupData = {
        ...formData,
        phone: formData.phone.trim() || null // Convert empty string to null
      };

      const response = await axios.post(`${API_URL}/auth/signup`, signupData);
      
      if (response.data) {
        // Show success message
        setShowSuccess(true);
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/patient/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response) {
        // Server responded with an error
        const message = error.response.data.message || 'Registration failed';
        setErrorMessage(message);
      } else if (error.request) {
        // Request was made but no response
        setErrorMessage('No response from server. Please try again.');
      } else {
        // Error in request setup
        setErrorMessage('Error setting up the request. Please try again.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Patient Sign Up
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {errorMessage}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSignup} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!errorMessage && !formData.name}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errorMessage && !formData.username}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errorMessage && (!formData.password || formData.password.length < 6)}
            helperText={formData.password && formData.password.length < 6 ? 'Password must be at least 6 characters' : ''}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errorMessage && !formData.email}
          />
          <TextField
            margin="normal"
            fullWidth
            id="phone"
            label="Phone Number (Optional)"
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            helperText="Optional - Use international format (e.g., +1234567890)"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="center">
            <Grid item>
              <Link to="/patient/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Success Message Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Registration successful! Redirecting to login page...
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SignupPage;
