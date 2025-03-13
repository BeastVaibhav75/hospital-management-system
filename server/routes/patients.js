const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { MedicalRecord, Bill, User, Appointment } = require('../models');
const { Op } = require('sequelize');

// Get patient's medical history
router.get('/:id/medical-history', auth, async (req, res) => {
  try {
    // Check if the user is authorized to view this medical history
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this medical history' });
    }

    const records = await MedicalRecord.findAll({
      where: { patientId: req.params.id },
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'email']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(records);
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({ message: 'Error fetching medical history' });
  }
});

// Get patient's bills
router.get('/:id/bills', auth, async (req, res) => {
  try {
    // Check if the user is authorized to view these bills
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these bills' });
    }

    const bills = await Bill.findAll({
      where: { patientId: req.params.id },
      include: [
        {
          model: Appointment,
          include: [
            {
              model: User,
              as: 'doctor',
              attributes: ['name', 'email']
            }
          ]
        }
      ],
      order: [['date', 'DESC']]
    });

    // Check for overdue bills and update their status
    const today = new Date();
    const updatedBills = await Promise.all(bills.map(async (bill) => {
      if (bill.status === 'pending' && bill.dueDate < today) {
        bill.status = 'overdue';
        await bill.save();
      }
      return bill;
    }));

    res.json(updatedBills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

// Process bill payment
router.post('/bills/:id/pay', auth, async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check if the user is authorized to pay this bill
    if (bill.patientId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to pay this bill' });
    }

    // Check if the bill is already paid
    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'This bill has already been paid' });
    }

    // Update bill status
    bill.status = 'paid';
    bill.paidAt = new Date();
    await bill.save();

    res.json({ message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

// Add medical record (doctor only)
router.post('/:id/medical-records', auth, async (req, res) => {
  try {
    // Check if the user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can add medical records' });
    }

    const { diagnosis, symptoms, medications, notes } = req.body;

    // Validate required fields
    if (!diagnosis || !symptoms || !medications) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create medical record
    const record = await MedicalRecord.create({
      patientId: req.params.id,
      doctorId: req.user.id,
      diagnosis,
      symptoms,
      medications,
      notes,
      date: new Date()
    });

    // Fetch the record with doctor information
    const recordWithDoctor = await MedicalRecord.findByPk(record.id, {
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['name', 'email']
        }
      ]
    });

    res.status(201).json(recordWithDoctor);
  } catch (error) {
    console.error('Error adding medical record:', error);
    res.status(500).json({ message: 'Error adding medical record' });
  }
});

module.exports = router; 