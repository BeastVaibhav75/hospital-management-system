const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const MedicalRecord = sequelize.define('medical_record', {
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
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  medications: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('medications');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('medications', JSON.stringify(value));
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['patientId', 'date']
    }
  ]
});

// Define associations
MedicalRecord.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
MedicalRecord.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

module.exports = MedicalRecord; 