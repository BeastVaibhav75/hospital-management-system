// server/routes/doctor.js
const router = require('express').Router();
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.use(verifyToken, verifyRole('doctor'));

// View Appointments (existing route)
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: req.userId },
      include: [{ model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] }],
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to Close Appointment and Update Medical Records
router.post('/appointments/close', async (req, res) => {
  const { appointmentId, diagnosis, prescriptions, testResults } = req.body;

  // Basic validation: appointmentId and diagnosis are required
  if (!appointmentId || !diagnosis) {
    return res.status(400).json({ message: 'Appointment ID and diagnosis are required' });
  }

  try {
    // Find the appointment and ensure it belongs to the logged-in doctor
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, doctorId: req.userId },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or access denied' });
    }

    // Update the appointment's status to 'completed'
    appointment.status = 'completed';
    await appointment.save();

    // Create a corresponding medical record (you might adjust this as needed)
    const medicalRecord = await MedicalRecord.create({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      diagnosis,
      prescriptions,  // this can be optional if not provided
      testResults,    // this can be optional as well
    });

    // If using dynamic attendance, no further action is needed.
    // If you have an "attendance" field on the User model, you can update it here

    res.json({ message: 'Appointment closed and medical record updated', appointment, medicalRecord });
  } catch (err) {
    console.error('Error closing appointment:', err);
    res.status(500).json({ message: 'Server error' });
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
