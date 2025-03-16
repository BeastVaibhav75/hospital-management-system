// server/routes/doctor.js
const router = require('express').Router();
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { Op, fn, col, where } = require('sequelize');
const sequelize = require('../config/database');

// Apply middleware to all routes
router.use(verifyToken);
router.use((req, res, next) => {
  if (req.userRole !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctor only.' });
  }
  next();
});

// Get dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get total appointments
    const totalAppointments = await Appointment.count({
      where: { doctorId: req.userId }
    });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.count({
      where: {
        doctorId: req.userId,
        date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // Get total unique patients
    const totalPatients = await Appointment.count({
      where: { doctorId: req.userId },
      distinct: true,
      col: 'patientId'
    });

    res.json({
      totalAppointments,
      todayAppointments,
      totalPatients
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// View Appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: req.userId },
      include: [{ model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['date', 'ASC']]
    });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Get Today's Appointments
router.get('/today-appointments', async (req, res) => {
  try {
    // Set up today's date range (same as in dashboard-stats)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.findAll({
      where: {
        doctorId: req.userId,
        date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [{ 
        model: User, 
        as: 'patient', 
        attributes: ['id', 'name', 'email', 'phone'] 
      }],
      order: [['date', 'ASC']]
    });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching today appointments:', err);
    res.status(500).json({ message: 'Failed to fetch today\'s appointments' });
  }
});

// Close Appointment and Update Medical Records
router.post('/appointments/close', async (req, res) => {
  const { appointmentId, diagnosis, prescriptions, testResults } = req.body;

  if (!appointmentId || !diagnosis) {
    return res.status(400).json({ message: 'Appointment ID and diagnosis are required' });
  }

  try {
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, doctorId: req.userId }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or access denied' });
    }

    appointment.status = 'completed';
    await appointment.save();

    const medicalRecord = await MedicalRecord.create({
      patientId: appointment.patientId,
      doctorId: req.userId,
      diagnosis,
      symptoms: 'Not specified', // Default value for required field
      medications: prescriptions || '[]',
      notes: testResults || '',
      date: new Date()
    });

    res.json({ message: 'Appointment completed and medical record updated', appointment, medicalRecord });
  } catch (err) {
    console.error('Error closing appointment:', err);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
});

// Optional: Route to view doctor attendance (dynamically by counting completed appointments)
router.get('/attendance', async (req, res) => {
  try {
    const attendanceCount = await Appointment.count({
      where: { doctorId: req.userId, status: 'completed' },
    });
    res.json({ attendance: attendanceCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
