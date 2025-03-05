import React, { useState, useEffect } from 'react';


import axios from 'axios';

function BookAppointment() {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/doctors`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setDoctors(res.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        alert('Failed to fetch doctors.');
      }
    };
    fetchDoctors();
  }, []);

  const handleBooking = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/patient/book`,
        { doctorId, date },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Appointment booked successfully!');
      // Reset form or redirect as needed
      setDoctorId('');
      setDate('');
    } catch (err) {
      console.error('Error booking appointment:', err);
      alert('Failed to book appointment.');
    }
  };

  return (
    <div>
      

      <h2>Book an Appointment</h2>
      <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
        <option value="">Select Doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            Dr. {doctor.name}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={handleBooking}>Book Appointment</button>
    </div>
  );
}

export default BookAppointment;
