import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const navbarRef = useRef(null);
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setExpanded(false);
    navigate('/');
  };

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      className="navbar-light shadow-sm" 
      fixed="top"
      expanded={expanded}
      ref={navbarRef}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          HealthCare Hub
        </Navbar.Brand>
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(!expanded)}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/patient/login" 
                  className="me-3"
                  onClick={() => setExpanded(false)}
                >
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/signup" 
                  className="me-3"
                  onClick={() => setExpanded(false)}
                >
                  Sign Up
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to={`/${userRole.toLowerCase()}/dashboard`} 
                  className="me-3"
                  onClick={() => setExpanded(false)}
                >
                  Dashboard
                </Nav.Link>
                {userRole === 'PATIENT' && (
                  <Nav.Link 
                    as={Link} 
                    to="/patient/book-appointment" 
                    className="me-3"
                    onClick={() => setExpanded(false)}
                  >
                    Book Appointment
                  </Nav.Link>
                )}
                <Nav.Link 
                  onClick={() => {
                    handleLogout();
                    setExpanded(false);
                  }} 
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
