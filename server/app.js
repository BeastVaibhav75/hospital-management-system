// server/app.js
require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./config/database');
const cors = require('cors');
// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/public', require('./routes/public')); // Added public routes

// Default route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Hospital Management System API');
});

// Sync database and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error('Error: ' + err));

module.exports = app;
