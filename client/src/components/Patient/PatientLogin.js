// client/src/components/Patient/PatientLogin.js
import React, { useState } from 'react';
import NavBar from '../NavBar'; // Importing the NavBar component

import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box } from '@mui/material';

function PatientLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const role = 'patient';
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        username,
        password,
        role,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate(`/patient`);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} p={3} bgcolor="#f5f5f5" borderRadius={5}>
        <Typography variant="h4" gutterBottom>
          Patient Login
        </Typography>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
          Login
        </Button>
        <Typography variant="body1" align="center">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default PatientLogin;
