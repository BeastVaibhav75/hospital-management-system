// server/routes/admin.js
const router = require('express').Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Appointment = require('../models/Appointment');

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

router.use(verifyToken, verifyRole('admin'));

// View Statistics
router.get('/stats', async (req, res) => {
  try {
    const totalPatients = await User.count({ where: { role: 'patient' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });
    const totalAppointments = await Appointment.count();

    res.json({ totalPatients, totalDoctors, totalAppointments });
  } catch (err) {
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


module.exports = router;
