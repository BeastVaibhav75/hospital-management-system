// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import MainLoginPage from './components/MainLoginPage';
import AdminLogin from './components/Admin/AdminLogin';
import DoctorLogin from './components/Doctor/DoctorLogin';
import PatientLogin from './components/Patient/PatientLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import PatientDashboard from './components/Patient/PatientDashboard';
import SignupPage from './components/SignupPage';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    
      <Router>
      <Routes>
        <Route path="/" element={<MainLoginPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/admin/*"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/*"
          element={
            <PrivateRoute role="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/*"
          element={
            <PrivateRoute role="patient">
              <PatientDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
      </Router>

  );
}

export default App;
