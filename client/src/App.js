// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './components/NavBar';

// Import components
import LandingPage from './components/LandingPage';
import MainLoginPage from './components/MainLoginPage';
import AdminLogin from './components/Admin/AdminLogin';
import DoctorLogin from './components/Doctor/DoctorLogin';
import PatientLogin from './components/Patient/PatientLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import PatientDashboard from './components/Patient/PatientDashboard';
import SignupPage from './components/SignupPage';
import PrivateRoute from './components/PrivateRoute';
import BookAppointment from './components/Patient/BookAppointment';
import ViewAppointments from './components/Doctor/ViewAppointments';
import ViewStatistics from './components/Admin/ViewStatistics';
import ManageUsers from './components/Admin/ManageUsers';

function App() {
  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<MainLoginPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/statistics" element={<PrivateRoute role="admin"><ViewStatistics /></PrivateRoute>} />
            <Route path="/admin/doctors" element={<PrivateRoute role="admin"><ManageUsers type="doctor" /></PrivateRoute>} />
            <Route path="/admin/patients" element={<PrivateRoute role="admin"><ManageUsers type="patient" /></PrivateRoute>} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
            <Route path="/doctor/dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
            <Route path="/doctor/appointments" element={<PrivateRoute role="doctor"><ViewAppointments /></PrivateRoute>} />
            <Route path="/doctor/today-appointments" element={<PrivateRoute role="doctor"><ViewAppointments filter="today" /></PrivateRoute>} />
            <Route path="/doctor/patients" element={<PrivateRoute role="doctor"><ViewAppointments filter="patients" /></PrivateRoute>} />
            
            {/* Patient Routes */}
            <Route path="/patient" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
            <Route path="/patient/dashboard" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
            <Route path="/patient/book-appointment" element={<PrivateRoute role="patient"><BookAppointment /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
