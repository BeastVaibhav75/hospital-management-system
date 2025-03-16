// server/routes/patient.js
const router = require('express').Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');

require('dotenv').config();
// Middleware to ensure the user is a patient
router.use(verifyToken, verifyRole('patient'));


// Book Appointment
router.post('/book', async (req, res) => {
  const { doctorId, date } = req.body;

  try {
    // Validate input
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required.' });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId: req.userId,
      date,
    });

    res.status(201).json({ 
      message: 'Appointment booked successfully',
      appointment 
    });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
});

// Cancel Appointment
router.post('/cancel', async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment || appointment.patientId !== req.userId) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View Medical Records
router.get('/medical-records', async (req, res) => {
  try {
    const records = await MedicalRecord.findAll({ where: { patientId: req.userId } });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Provide Feedback
router.post('/feedback', async (req, res) => {
  const { appointmentId, feedback } = req.body;

  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment || appointment.patientId !== req.userId) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.feedback = feedback;
    await appointment.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
