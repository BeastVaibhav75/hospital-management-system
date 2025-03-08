// client/src/components/Admin/AdminLogin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'ADMIN') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          ...formData,
          role: 'admin'
        }
      );
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'ADMIN');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button 
            variant="info" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default AdminLogin;
