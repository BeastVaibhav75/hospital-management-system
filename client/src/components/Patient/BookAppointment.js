import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BookAppointment() {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/public/doctors`, {
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
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Book an Appointment</h2>
          <div className="form-group mb-3">
            <label htmlFor="doctorSelect">Select Doctor</label>
            <select 
              id="doctorSelect"
              className="form-control" 
              value={doctorId} 
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <option value="">Choose a doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group mb-3">
            <label htmlFor="appointmentDate">Appointment Date & Time</label>
            <input
              id="appointmentDate"
              type="datetime-local"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleBooking}
            disabled={!doctorId || !date}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;
