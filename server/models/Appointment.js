// server/models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    get() {
      const value = this.getDataValue('date');
      if (value) {
        return new Date(value.getTime() - value.getTimezoneOffset() * 60000);
      }
      return value;
    },
    set(value) {
      if (value) {
        const date = new Date(value);
        this.setDataValue('date', new Date(date.getTime() + date.getTimezoneOffset() * 60000));
      } else {
        this.setDataValue('date', value);
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'booked', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('feedback');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('feedback', value ? JSON.stringify(value) : null);
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['patientId', 'date']
    },
    {
      fields: ['doctorId', 'date']
    }
  ]
});

// Define associations
Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

module.exports = Appointment;
