// client/src/components/Doctor/ViewAttendance.js
import React, { useEffect, useState } from 'react';


import axios from 'axios';

function ViewAttendance() {
  const [attendance, setAttendance] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/doctor/attendance`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setAttendance(res.data.attendance);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        alert('Failed to fetch attendance.');
      }
    };
    fetchAttendance();
  }, []);

  return (
    <div>
     

      <h2>Attendance</h2>
      <p>You have completed <strong>{attendance}</strong> appointments.</p>
    </div>
  );
}

export default ViewAttendance;
