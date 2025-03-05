// server/routes/public.js

const router = require('express').Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Get All Doctors (Accessible to authenticated users)
router.get('/doctors', verifyToken, async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['id', 'name', 'email', 'phone'], // Select necessary fields
    });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
