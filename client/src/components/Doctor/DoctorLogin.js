// client/src/components/Doctor/DoctorLogin.js
import React, { useState } from 'react';
import NavBar from '../NavBar'; // Importing the NavBar component

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box } from '@mui/material';

function DoctorLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const role = 'doctor';
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
      navigate(`/doctor`);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5} p={3} bgcolor="#f5f5f5" borderRadius={5}>
        <Typography variant="h4" gutterBottom>
          Doctor Login
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
      </Box>
    </Container>
  );
}

export default DoctorLogin;
