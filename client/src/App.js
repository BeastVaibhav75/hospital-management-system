// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './components/NavBar';

// Import components
import LandingPage from './components/LandingPage';
import AdminLogin from './components/Admin/AdminLogin';
import DoctorLogin from './components/Doctor/DoctorLogin';
import PatientLogin from './components/Patient/PatientLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import PatientDashboard from './components/Patient/PatientDashboard';
import SignupPage from './components/SignupPage';
import ForgotPassword from './components/ForgotPassword';
import PrivateRoute from './components/PrivateRoute';
import BookAppointment from './components/BookAppointment';
import ViewAppointments from './components/Doctor/ViewAppointments';
import TodayAppointments from './components/Doctor/TodayAppointments';
import ViewStatistics from './components/Admin/ViewStatistics';
import ManageDoctors from './components/Admin/ManageDoctors';
import ManagePatients from './components/Admin/ManagePatients';
import PatientAppointments from './components/Patient/PatientAppointments';
import MedicalHistory from './components/Patient/MedicalHistory';
import ProvideFeedback from './components/Patient/ProvideFeedback';
import PatientBills from './components/Patient/PatientBills';
import ManageAppointments from './components/Admin/ManageAppointments';
import DoctorPatients from './components/Doctor/DoctorPatients';

function App() {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <div className="app-container">
        <NavBar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/statistics" element={<PrivateRoute role="admin"><ViewStatistics /></PrivateRoute>} />
            <Route path="/admin/doctors" element={<PrivateRoute role="admin"><ManageDoctors /></PrivateRoute>} />
            <Route path="/admin/patients" element={<PrivateRoute role="admin"><ManagePatients /></PrivateRoute>} />
            <Route path="/admin/appointments" element={<PrivateRoute role="admin"><ManageAppointments /></PrivateRoute>} />
            
            {/* Doctor Routes */}
            <Route path="/doctor" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
            <Route path="/doctor/dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
            <Route path="/doctor/appointments" element={<PrivateRoute role="doctor"><ViewAppointments /></PrivateRoute>} />
            <Route path="/doctor/today-appointments" element={<PrivateRoute role="doctor"><TodayAppointments /></PrivateRoute>} />
            <Route path="/doctor/patients" element={
              <PrivateRoute role="doctor">
                <DoctorPatients />
              </PrivateRoute>
            } />
            
            {/* Patient Routes */}
            <Route path="/patient" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
            <Route path="/patient/dashboard" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
            <Route path="/patient/book-appointment" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<PrivateRoute role="patient"><PatientAppointments /></PrivateRoute>} />
            <Route path="/patient/medical-history" element={<PrivateRoute role="patient"><MedicalHistory /></PrivateRoute>} />
            <Route path="/patient/feedback" element={<PrivateRoute role="patient"><ProvideFeedback /></PrivateRoute>} />
            <Route path="/patient/bills" element={<PrivateRoute role="patient"><PatientBills /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
