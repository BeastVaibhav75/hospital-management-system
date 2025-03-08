// client/src/components/SignupPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
} from '@mui/material';

function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    email: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async () => {
    if (!formData.username || !formData.password || !formData.name || !formData.email) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/signup`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate(`/patient`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Signup failed. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} p={3} bgcolor="#f5f5f5" borderRadius={5}>
        <Typography variant="h4" gutterBottom>
          Patient Signup
        </Typography>
        {errorMessage && (
          <Typography variant="body2" color="error" align="center">
            {errorMessage}
          </Typography>
        )}
        <TextField
          label="Name"
          name="name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          label="Username"
          name="username"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          label="Phone"
          name="phone"
          fullWidth
          margin="normal"
          value={formData.phone}
          onChange={handleChange}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleSignup}>
          Sign Up
        </Button>
      </Box>
    </Container>
  );
}

export default SignupPage;
