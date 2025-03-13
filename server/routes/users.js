const express = require('express');
const router = express.Router();
const { User } = require('../models/index');

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['id', 'name', 'email'] // Only send necessary information
    });
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 