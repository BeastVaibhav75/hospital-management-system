// client/src/components/Doctor/DoctorDashboard.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';


import DoctorLogin from './DoctorLogin';
import ViewAppointments from './ViewAppointments';
import UpdateMedicalRecords from './UpdateMedicalRecords'; // if separate
import ViewAttendance from './ViewAttendance';

function DoctorDashboard() {
  return (
    <div>
   

      <h1>Doctor Dashboard</h1>
      <nav>
        <ul>
          <li>
            <Link to="/doctor/appointments">View Appointments</Link>
          </li>
          <li>
            <Link to="/doctor/attendance">View Attendance</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="appointments" element={<ViewAppointments />} />
        <Route path="attendance" element={<ViewAttendance />} />
      </Routes>
    </div>
  );
}

export default DoctorDashboard;
