// client/src/components/Patient/ViewMedicalHistory.js
import React, { useEffect, useState } from 'react';


import axios from 'axios';

function ViewMedicalHistory() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/patient/medical-records', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div>
      

      <h2>Your Medical History</h2>
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            <p><strong>Date:</strong> {record.createdAt}</p>
            <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
            <p><strong>Prescriptions:</strong> {record.prescriptions}</p>
            <p><strong>Test Results:</strong> {record.testResults}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ViewMedicalHistory;
