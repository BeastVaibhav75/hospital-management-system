const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Appointment = require('./Appointment');

const Bill = sequelize.define('bill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue'),
    defaultValue: 'pending'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['patientId', 'status']
    },
    {
      fields: ['appointmentId']
    }
  ]
});

// Define associations
Bill.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
Bill.belongsTo(Appointment, { foreignKey: 'appointmentId' });

module.exports = Bill; 