// client/src/components/Patient/PatientDashboard.js
import React from 'react';


import { Routes, Route, Link } from 'react-router-dom';
import BookAppointment from './BookAppointment';
import ViewMedicalHistory from './ViewMedicalHistory';
import ProvideFeedback from './ProvideFeedback';
import ViewBills from './ViewBills';

function PatientDashboard() {
  return (
    <div>
      

      <h1>Patient Dashboard</h1>
      <nav>
        <ul>
          <li>
            <Link to="/patient/book-appointment">Book Appointment</Link>
          </li>
          <li>
            <Link to="/patient/medical-history">Medical History</Link>
          </li>
          <li>
            <Link to="/patient/feedback">Provide Feedback</Link>
          </li>
          <li>
            <Link to="/patient/bills">View Bills</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="medical-history" element={<ViewMedicalHistory />} />
        <Route path="feedback" element={<ProvideFeedback />} />
        <Route path="bills" element={<ViewBills />} />
      </Routes>
    </div>
  );
}

export default PatientDashboard;
