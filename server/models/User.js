// server/models/User.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'doctor', 'patient'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidPhone(value) {
          if (value === null || value === '') return; // Allow empty/null values
          if (!/^\+?[1-9]\d{1,14}$/.test(value)) {
            throw new Error('Invalid phone number format');
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isSpecialization(value) {
          if (this.role === 'doctor' && !value) {
            throw new Error('Specialization is required for doctors');
          }
        }
      }
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isExperience(value) {
          if (this.role === 'doctor' && !value) {
            throw new Error('Experience is required for doctors');
          }
          if (value !== null && (value < 0 || value > 50)) {
            throw new Error('Experience must be between 0 and 50 years');
          }
        }
      }
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: 'user',
  }
);

// Hash password before saving only if it's not already hashed
User.beforeCreate(async (user) => {
  if (user.password && !user.password.startsWith('$2')) {
    console.log('Hashing password for user:', user.username);
    const saltRounds = 10;
    const hashed = await bcrypt.hash(user.password, saltRounds);
    user.password = hashed;
  }
});

module.exports = User;
