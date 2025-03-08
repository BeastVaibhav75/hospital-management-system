// client/src/components/Patient/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarPlus, FaHistory, FaCommentMedical, FaFileInvoiceDollar } from 'react-icons/fa';
import axios from 'axios';
import './PatientDashboard.css';

function PatientDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingBills: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/patient/dashboard-stats`,
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
        <h2 className="dashboard-title">Patient Dashboard</h2>
        <Row className="g-4">
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/patient/book-appointment')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-primary">
                    <FaCalendarPlus className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Book Appointment</h6>
                    <h3 className="card-value">New</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/patient/medical-history')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-success">
                    <FaHistory className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Medical History</h6>
                    <h3 className="card-value">{stats.completedAppointments}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/patient/feedback')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-info">
                    <FaCommentMedical className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Provide Feedback</h6>
                    <h3 className="card-value">Give</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card 
              className="dashboard-card"
              onClick={() => handleCardClick('/patient/bills')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-warning">
                    <FaFileInvoiceDollar className="dashboard-icon" />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle">Pending Bills</h6>
                    <h3 className="card-value">{stats.pendingBills}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Information Section */}
        <Row className="mt-5">
          <Col md={12}>
            <Card className="info-card">
              <Card.Body>
                <h4 className="info-title">Upcoming Appointments</h4>
                <div className="appointment-count">
                  <span className="number">{stats.upcomingAppointments}</span>
                  <span className="label">Scheduled</span>
                </div>
                <button 
                  className="view-all-btn"
                  onClick={() => handleCardClick('/patient/appointments')}
                >
                  View All Appointments
                </button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default PatientDashboard;
