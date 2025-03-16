// client/src/components/Doctor/DoctorDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaCalendarCheck, FaUserInjured, FaClock, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/doctor/login');
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/doctor/dashboard-stats`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data) {
          setStats(response.data);
          setError('');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/doctor/login');
        } else {
          setError('Failed to load dashboard statistics. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  const handleCardClick = (route) => {
    navigate(route);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Container>
          <div className="text-center py-5">Loading...</div>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Container>
        <h2 className="dashboard-title">Doctor Dashboard</h2>
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/doctor/appointments')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-primary">
                    <FaCalendarCheck className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Total Appointments</h6>
                    <h3 className="card-value">{stats.totalAppointments}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/doctor/today-appointments')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-success">
                    <FaClock className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Today's Appointments</h6>
                    <h3 className="card-value">{stats.todayAppointments}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/doctor/patients')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-info">
                    <FaUserInjured className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Total Patients</h6>
                    <h3 className="card-value">{stats.totalPatients}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/doctor/medical-records')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-warning">
                    <FaList className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Medical Records</h6>
                    <h3 className="card-value">View</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DoctorDashboard;
