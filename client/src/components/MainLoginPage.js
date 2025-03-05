// client/src/components/MainLoginPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import CollapsibleExample from './NavBar';
import { Container, Button, Card } from "react-bootstrap";


function MainLoginPage() {
  return (
      <>
      <CollapsibleExample />
      <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="text-center p-5 bg-dark text-white rounded-4 shadow-lg">
        <Card.Body>
          <Card.Title as="h1" className="fw-bold">
            Welcome to 
          </Card.Title>
          <Card.Text className="fs-5">
            Your Advanced Healthcare Management Solution
          </Card.Text>
          <Button variant="warning" size="lg" className="fw-bold">
            Get Started
          </Button>
        </Card.Body>
      </Card>
    </Container>
      <div>
      <h1>Welcome to the Hospital Management System</h1>
      <p>Please select your role to log in:</p>
      <ul>
        <li><Link to="/admin/login">Admin Login</Link></li>
        <li><Link to="/doctor/login">Doctor Login</Link></li>
        <li><Link to="/patient/login">Patient Login</Link></li>
      </ul>
      <p>New patient? <Link to="/signup">Sign up here</Link></p>
    </div>
    </>
  );
}

export default MainLoginPage;
