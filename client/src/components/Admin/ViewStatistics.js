// client/src/components/Admin/ViewStatistics.js
import React, { useEffect, useState } from 'react';


import axios from 'axios';

function ViewStatistics() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatistics();
  }, []);

  return (
    <div>
      

      <h2>Hospital Statistics</h2>
      <p><strong>Total Patients:</strong> {stats.totalPatients}</p>
      <p><strong>Total Doctors:</strong> {stats.totalDoctors}</p>
      <p><strong>Total Appointments:</strong> {stats.totalAppointments}</p>
      {/* Add more stats as needed */}
    </div>
  );
}

export default ViewStatistics;
