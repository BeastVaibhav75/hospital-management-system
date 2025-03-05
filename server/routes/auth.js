// server/routes/auth.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
require('dotenv').config();
const User = require('../models/User');

// Login Route
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await User.findOne({ where: { username, role } });
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

// Password Recovery Route
router.post('/recover', async (req, res) => {
  // Implement password recovery logic
});

// Patient Signup Route
router.post('/signup', async (req, res) => {
  const { username, password, name, phone, email } = req.body;

  // Server-side validation
  if (!username || !password || !name || !email) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check for existing username or email
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with that username or email already exists' });
    }

    // Create new user
      const newUser = await User.create({
      username,
      password,
      role: 'patient',
      name,
      phone,
      email,
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ message: 'User registered successfully', token, role: newUser.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
