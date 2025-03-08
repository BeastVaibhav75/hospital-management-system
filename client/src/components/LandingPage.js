import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUserMd, FaUser, FaUserTie, FaClock, FaCalendarCheck, FaUserNurse, FaDatabase } from 'react-icons/fa';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col md={6} className="text-white">
              <h1 className="display-4 fw-bold mb-4">Welcome to HealthCare Hub</h1>
              <p className="lead mb-4">
                Your trusted partner in healthcare management. Experience seamless medical services
                with our state-of-the-art hospital management system.
              </p>
              <Button 
                variant="light" 
                size="lg" 
                className="me-3"
                onClick={() => navigate('/patient/login')}
              >
                Get Started
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <h2 className="text-center mb-5">Access Your Portal</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 text-center hover-card">
                <Card.Body>
                  <FaUser size={48} className="mb-3 text-primary" />
                  <Card.Title>Patient Portal</Card.Title>
                  <Card.Text>
                    Book appointments, view medical records, and manage your healthcare journey.
                  </Card.Text>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate('/patient/login')}
                  >
                    Patient Login
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 text-center hover-card">
                <Card.Body>
                  <FaUserMd size={48} className="mb-3 text-success" />
                  <Card.Title>Doctor Portal</Card.Title>
                  <Card.Text>
                    Manage appointments, update patient records, and provide care efficiently.
                  </Card.Text>
                  <Button 
                    variant="outline-success" 
                    onClick={() => navigate('/doctor/login')}
                  >
                    Doctor Login
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 text-center hover-card">
                <Card.Body>
                  <FaUserTie size={48} className="mb-3 text-info" />
                  <Card.Title>Admin Portal</Card.Title>
                  <Card.Text>
                    Oversee hospital operations, manage staff, and ensure smooth functioning.
                  </Card.Text>
                  <Button 
                    variant="outline-info" 
                    onClick={() => navigate('/admin/login')}
                  >
                    Admin Login
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <section className="services-section py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Our Services</h2>
          <Row className="g-4">
            <Col md={3}>
              <div className="service-item text-center">
                <FaClock size={32} className="mb-3 text-primary" />
                <h4>24/7 Care</h4>
                <p>Round-the-clock medical assistance</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="service-item text-center">
                <FaCalendarCheck size={32} className="mb-3 text-primary" />
                <h4>Online Booking</h4>
                <p>Easy appointment scheduling</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="service-item text-center">
                <FaUserNurse size={32} className="mb-3 text-primary" />
                <h4>Expert Doctors</h4>
                <p>Qualified healthcare professionals</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="service-item text-center">
                <FaDatabase size={32} className="mb-3 text-primary" />
                <h4>Digital Records</h4>
                <p>Secure medical history access</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row>
            <Col md={6}>
              <h5>HealthCare Hub</h5>
              <p>Your Health, Our Priority</p>
            </Col>
            <Col md={6} className="text-md-end">
              <p>© 2024 HealthCare Hub. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default LandingPage; 