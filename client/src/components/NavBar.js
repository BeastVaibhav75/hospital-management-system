import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="navbar-light shadow-sm" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          HealthCare Hub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login" className="me-3">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" className="me-3">
                  Sign Up
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to={`/${userRole.toLowerCase()}/dashboard`} 
                  className="me-3"
                >
                  Dashboard
                </Nav.Link>
                {userRole === 'PATIENT' && (
                  <Nav.Link 
                    as={Link} 
                    to="/patient/book-appointment" 
                    className="me-3"
                  >
                    Book Appointment
                  </Nav.Link>
                )}
                <Nav.Link 
                  onClick={handleLogout} 
                  className="text-danger"
                >
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
