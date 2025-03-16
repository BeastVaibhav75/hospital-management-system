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

// Public routes (no authentication required)
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

// Protected routes (authentication required)
// Apply authentication middleware to all routes below this point
const authenticateAdmin = [verifyToken, verifyRole('admin')];
router.use(authenticateAdmin);

// Doctor Management
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['id', 'username', 'name', 'phone', 'email', 'specialization', 'experience', 'createdAt']
    });
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/doctors', async (req, res) => {
  try {
    const { username, password, name, email, phone, specialization, experience } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const newDoctor = await User.create({
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      specialization,
      experience,
      role: 'doctor'
    });

    // Remove password from response
    const { password: _, ...doctorData } = newDoctor.toJSON();

    res.status(201).json(doctorData);
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ 
      message: err.message || 'Error adding doctor',
      details: err.errors?.map(e => e.message) || []
    });
  }
});

router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    // Check if doctor exists and is actually a doctor
    const doctor = await User.findOne({
      where: { id: doctorId, role: 'doctor' }
    });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Delete doctor's appointments first
    await Appointment.destroy({
      where: { doctorId }
    });

    // Then delete the doctor
    await User.destroy({
      where: { id: doctorId }
    });

    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({ message: err.message });
  }
});

// Patient Management
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

router.post('/patients', async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient
    const newPatient = await User.create({
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      role: 'patient'
    });

    // Remove password from response
    const { password: _, ...patientData } = newPatient.toJSON();

    res.status(201).json(patientData);
  } catch (err) {
    console.error('Error adding patient:', err);
    res.status(500).json({ 
      message: err.message || 'Error adding patient',
      details: err.errors?.map(e => e.message) || []
    });
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

// View Statistics
router.get('/stats', async (req, res) => {
  try {
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('Fetching appointments for date range:');
    console.log('Today (start):', today.toISOString());
    console.log('Tomorrow (end):', tomorrow.toISOString());

    // First get all appointments to compare
    const allAppointments = await Appointment.findAll({
      attributes: ['id', 'date', 'status']
    });
    
    console.log('All appointments:', allAppointments.map(a => ({
      id: a.id,
      date: a.date,
      status: a.status
    })));

    const appointmentsToday = await Appointment.count({
      where: {
        date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        status: {
          [Op.notIn]: ['cancelled']
        }
      }
    });

    console.log('Appointments Today Count:', appointmentsToday);

    // Get total counts - include all appointments regardless of status
    const totalAppointments = await Appointment.count();

    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });

    console.log('Final stats:', {
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsToday
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

// Get all appointments with patient and doctor details
router.get('/all-appointments', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'specialization']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

module.exports = router;
