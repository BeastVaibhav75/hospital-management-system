// server/routes/admin.js
const router = require('express').Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

const User = require('../models/User');
const Appointment = require('../models/Appointment');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username, role: 'admin' } });
    if (!user) return res.status(404).json({ message: 'User not found or role mismatch' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.use(verifyToken, verifyRole('admin'));

// View Statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total counts
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });
    const totalAppointments = await Appointment.count();

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentsToday = await Appointment.count({
      where: {
        date: {
          [Op.gte]: today
        }
      }
    });

    // Generate last 12 months
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // Format: YYYY-MM
    }).reverse();

    // Get appointments by month for the last 12 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    const appointments = await Appointment.findAll({
      where: {
        date: {
          [Op.gte]: startDate
        }
      },
      attributes: ['date']
    });

    // Process appointments to group by month
    const appointmentsByMonth = appointments.reduce((acc, appointment) => {
      const date = new Date(appointment.date);
      const month = date.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Fill in missing months with zero counts for appointments
    const filledAppointmentsByMonth = last12Months.map(month => ({
      month,
      count: appointmentsByMonth[month] || 0
    }));

    // Get doctors by specialization
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['specialization']
    });

    // Process doctors to group by specialization
    const doctorsBySpecializationMap = doctors.reduce((acc, doctor) => {
      const spec = doctor.specialization || 'No Specialization';
      acc[spec] = (acc[spec] || 0) + 1;
      return acc;
    }, {});

    const doctorsBySpecialization = Object.entries(doctorsBySpecializationMap).map(([specialization, count]) => ({
      specialization,
      count
    }));

    // Get patient growth (new patients by month)
    const patients = await User.findAll({
      where: {
        role: 'patient',
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: ['createdAt']
    });

    // Process patients to group by month
    const patientsByMonth = patients.reduce((acc, patient) => {
      const date = new Date(patient.createdAt);
      const month = date.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Fill in missing months with zero counts for patient growth
    const filledPatientGrowth = last12Months.map(month => ({
      month,
      count: patientsByMonth[month] || 0
    }));

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsToday,
      appointmentsByMonth: filledAppointmentsByMonth,
      doctorsBySpecialization,
      patientGrowth: filledPatientGrowth
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Manage Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users', async (req, res) => {
  const { username, password, role, name, phone, email } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(409).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role, name, phone, email });
    res.json({ message: 'User added successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await User.destroy({ where: { id: userId } });
    res.json({ message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manage Patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await User.findAll({
      where: { role: 'patient' },
      attributes: ['id', 'username', 'name', 'phone', 'email', 'createdAt']
    });
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/patients/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Check if patient exists and is actually a patient
    const patient = await User.findOne({
      where: { id: patientId, role: 'patient' }
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Delete patient's appointments first
    await Appointment.destroy({
      where: { patientId }
    });

    // Then delete the patient
    await User.destroy({
      where: { id: patientId }
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
