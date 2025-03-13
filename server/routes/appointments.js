const express = require('express');
const router = express.Router();
const { Appointment, User } = require('../models/index');
const { sendAppointmentConfirmation } = require('../utils/twilio');
const { Op } = require('sequelize');
const { auth } = require('../middlewares/auth');

// Helper function to check if date is valid for booking
const isValidBookingTime = (date) => {
  const appointmentDate = new Date(date);
  const day = appointmentDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const hours = appointmentDate.getHours();
  const minutes = appointmentDate.getMinutes();

  // Check if it's weekend (0 is Sunday, 6 is Saturday)
  if (day === 0 || day === 6) return false;

  // Check if time is between 9 AM and 4 PM
  if (hours < 9 || hours >= 16) return false;

  // Only allow bookings at the start of each hour
  if (minutes !== 0) return false;

  return true;
};

// Book Appointment
router.post('/book', async (req, res) => {
  try {
    const { patientId, doctorId, date } = req.body;
    const appointmentDate = new Date(date);

    // Validate appointment date and time
    if (!isValidBookingTime(appointmentDate)) {
      return res.status(400).json({
        message: 'Appointments can only be booked Monday to Friday, 9 AM to 4 PM'
      });
    }

    // Check if the appointment time is in the past
    if (appointmentDate < new Date()) {
      return res.status(400).json({
        message: 'Cannot book appointments in the past'
      });
    }

    // Check if doctor exists
    const doctor = await User.findOne({
      where: { id: doctorId, role: 'doctor' }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if patient exists
    const patient = await User.findOne({
      where: { id: patientId, role: 'patient' }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        date: appointmentDate,
        status: 'booked'
      }
    });

    if (existingAppointment) {
      return res.status(409).json({ message: 'This slot is already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: appointmentDate,
      status: 'booked'
    });

    // Send confirmation email
    const appointmentDetails = {
      date: appointmentDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      doctorName: doctor.name,
      status: 'booked'
    };

    try {
      await sendAppointmentConfirmation(patient.phone, appointmentDetails, patient.email);
    } catch (emailError) {
      console.error('Failed to send email confirmation:', emailError);
      // Don't fail the appointment booking if email fails
    }

    res.status(201).json({
      message: 'Appointment booked successfully! Check your email for confirmation.',
      appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Available Slots
router.get('/available-slots', async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const queryDate = new Date(date);
    
    // Generate all possible slots for the day
    const slots = [];
    for (let hour = 9; hour < 16; hour++) {
      const slotDate = new Date(queryDate);
      slotDate.setHours(hour, 0, 0, 0);
      
      if (isValidBookingTime(slotDate)) {
        slots.push(slotDate);
      }
    }

    // Get booked appointments
    const bookedAppointments = await Appointment.findAll({
      where: {
        doctorId,
        date: {
          [Op.gte]: new Date(queryDate.setHours(0, 0, 0, 0)),
          [Op.lt]: new Date(queryDate.setHours(23, 59, 59, 999))
        },
        status: 'booked'
      }
    });

    // Filter out booked slots and past times
    const now = new Date();
    const availableSlots = slots.filter(slot => {
      // Filter out past times
      if (slot < now) return false;

      // Filter out booked slots
      return !bookedAppointments.some(appointment => {
        const appointmentTime = new Date(appointment.date);
        return appointmentTime.getHours() === slot.getHours();
      });
    });

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Patient's Appointments
router.get('/patient/:patientId', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.params.patientId },
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'email']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Doctor's Appointments
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: req.params.doctorId },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['name', 'email', 'phone']
        }
      ],
      order: [['date', 'ASC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel appointment
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the user is authorized to cancel this appointment
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Check if the appointment can be cancelled
    if (appointment.status !== 'booked') {
      return res.status(400).json({ message: 'Cannot cancel a completed or already cancelled appointment' });
    }

    // Update the appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
});

// Submit feedback for an appointment
router.put('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the user is authorized to provide feedback
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to provide feedback for this appointment' });
    }

    // Update the appointment with feedback
    appointment.feedback = { rating, comment };
    await appointment.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

module.exports = router; 