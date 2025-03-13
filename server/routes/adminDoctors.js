const router = require('express').Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { Op } = require('sequelize');

// Middleware to ensure the user is an admin
router.use(verifyToken, verifyRole('admin'));

// Get all doctors with their statistics
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'specialization',
        'experience'
      ]
    });

    // Get statistics for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's appointments
        const appointmentsToday = await Appointment.count({
          where: {
            doctorId: doctor.id,
            date: {
              [Op.gte]: today
            },
            status: {
              [Op.in]: ['booked', 'completed']
            }
          }
        });

        // Get total appointments
        const totalAppointments = await Appointment.count({
          where: {
            doctorId: doctor.id,
            status: {
              [Op.in]: ['booked', 'completed']
            }
          }
        });

        // Get unique patients today
        const patientsToday = await Appointment.count({
          where: {
            doctorId: doctor.id,
            date: {
              [Op.gte]: today
            },
            status: {
              [Op.in]: ['booked', 'completed']
            }
          },
          distinct: true,
          col: 'patientId'
        });

        // Get total unique patients
        const totalPatients = await Appointment.count({
          where: {
            doctorId: doctor.id,
            status: {
              [Op.in]: ['booked', 'completed']
            }
          },
          distinct: true,
          col: 'patientId'
        });

        return {
          ...doctor.toJSON(),
          appointmentsToday,
          totalAppointments,
          patientsToday,
          totalPatients
        };
      })
    );

    res.json(doctorsWithStats);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
});

// Add a new doctor
router.post('/doctors', async (req, res) => {
  try {
    const {
      username,
      password,
      name,
      email,
      phone,
      specialization,
      experience
    } = req.body;

    // Validate required fields
    if (!username || !password || !name || !email || !specialization || !experience) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new doctor
    const doctor = await User.create({
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
    const { password: _, ...doctorWithoutPassword } = doctor.toJSON();
    res.status(201).json(doctorWithoutPassword);
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ message: 'Failed to add doctor' });
  }
});

// Delete a doctor
router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Check if doctor exists
    const doctor = await User.findOne({
      where: { id: doctorId, role: 'doctor' }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor has any appointments
    const hasAppointments = await Appointment.count({
      where: { doctorId }
    });

    if (hasAppointments > 0) {
      return res.status(400).json({
        message: 'Cannot delete doctor with existing appointments'
      });
    }

    // Delete doctor
    await doctor.destroy();
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({ message: 'Failed to delete doctor' });
  }
});

module.exports = router; 