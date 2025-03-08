// client/src/components/Doctor/ViewAppointments.js
import React, { useEffect, useState } from 'react';
import StickyNavbar from '../NavBar'; // Importing the NavBar component

import axios from 'axios';

function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [medicalData, setMedicalData] = useState({
    diagnosis: '',
    prescriptions: '',
    testResults: '',
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/doctor/appointments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        alert('Failed to fetch appointments.');
      }
    };
    fetchAppointments();
  }, []);

  const handleComplete = async (appointmentId) => {
    // When the button is clicked, set the selected appointment
    setSelectedAppointmentId(appointmentId);
  };

  const handleSubmitMedicalRecord = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/doctor/appointments/close`,
        { appointmentId: selectedAppointmentId, ...medicalData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Appointment closed and medical record updated.');

      // Update the appointment status locally
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppointmentId ? { ...appt, status: 'completed' } : appt
        )
      );
      // Clear the form and selected appointment
      setSelectedAppointmentId(null);
      setMedicalData({
        diagnosis: '',
        prescriptions: '',
        testResults: '',
      });
    } catch (err) {
      console.error('Error closing appointment:', err);
      alert('Failed to close appointment.');
    }
  };

  return (
    <div>
      <h2>Your Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <p>
                <strong>Date:</strong> {new Date(appointment.date).toLocaleString()}
              </p>
              <p>
                <strong>Patient:</strong> {appointment.patient.name}
              </p>
              <p>
                <strong>Status:</strong> {appointment.status}
              </p>
              {appointment.status === 'booked' && (
                <button onClick={() => handleComplete(appointment.id)}>
                  Close Appointment
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedAppointmentId && (
        <div>
          <h3>Update Medical Records</h3>
          <input
            type="text"
            placeholder="Diagnosis" 
            value={medicalData.diagnosis}
            onChange={(e) =>
              setMedicalData({ ...medicalData, diagnosis: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Prescriptions"
            value={medicalData.prescriptions}
            onChange={(e) =>
              setMedicalData({ ...medicalData, prescriptions: e.target.value })
            }
          />
          <textarea
            placeholder="Test Results"
            value={medicalData.testResults}
            onChange={(e) =>
              setMedicalData({ ...medicalData, testResults: e.target.value })
            }
          />
          <button onClick={handleSubmitMedicalRecord}>Submit Medical Record</button>
          <button onClick={() => setSelectedAppointmentId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default ViewAppointments;
