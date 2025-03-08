// client/src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaUsers, FaCalendarCheck, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="dashboard-container">
      <Container>
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/admin/doctors')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-primary">
                    <FaUserMd className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Total Doctors</h6>
                    <h3 className="card-value">{stats.totalDoctors}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/admin/patients')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-success">
                    <FaUsers className="dashboard-icon" />
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
              onClick={() => handleCardClick('/admin/appointments')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-info">
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
              onClick={() => handleCardClick('/admin/statistics')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-warning">
                    <FaChartLine className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Statistics</h6>
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

export default AdminDashboard;
