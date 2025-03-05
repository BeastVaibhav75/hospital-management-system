// client/src/components/Doctor/UpdateMedicalRecords.js
import React, { useState, useEffect } from 'react';


import axios from 'axios';

function UpdateMedicalRecords() {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [testResults, setTestResults] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/doctor/patients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/doctor/medical-records`,
        { patientId, diagnosis, prescriptions, testResults },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      alert('Medical record updated successfully!');
      // Clear form
      setPatientId('');
      setDiagnosis('');
      setPrescriptions('');
      setTestResults('');
    } catch (err) {
      console.error(err);
      alert('Failed to update medical record');
    }
  };

  return (
    <div>
  

      <h2>Update Medical Records</h2>
      <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
        <option value="">Select Patient</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Diagnosis"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
      />
      <textarea
        placeholder="Prescriptions"
        value={prescriptions}
        onChange={(e) => setPrescriptions(e.target.value)}
      />
      <textarea
        placeholder="Test Results"
        value={testResults}
        onChange={(e) => setTestResults(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default UpdateMedicalRecords;
