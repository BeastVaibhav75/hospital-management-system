// server/models/MedicalRecord.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class MedicalRecord extends Model {}

MedicalRecord.init(
  {
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    prescriptions: DataTypes.TEXT,
    testResults: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: 'medical_record',
  }
);

// Each medical record is linked to a patient and a doctor.
MedicalRecord.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
MedicalRecord.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

module.exports = MedicalRecord;
