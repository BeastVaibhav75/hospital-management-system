// client/src/components/Patient/ProvideFeedback.js
import React, { useState, useEffect } from 'react';


import axios from 'axios';

function ProvideFeedback() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/patient/appointments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppointments();
  }, []);

  const submitFeedback = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/patient/feedback',
        { appointmentId: selectedAppointmentId, feedback },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Thank you for your feedback!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback');
    }
  };

  return (
    <div>
      

      <h2>We Value Your Feedback</h2>
      <select
        value={selectedAppointmentId}
        onChange={(e) => setSelectedAppointmentId(e.target.value)}
      >
        <option value="">Select Appointment</option>
        {appointments.map((app) => (
          <option key={app.id} value={app.id}>
            {app.date} with Dr. {app.doctor.name}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Your feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <button onClick={submitFeedback}>Submit Feedback</button>
    </div>
  );
}

export default ProvideFeedback;
