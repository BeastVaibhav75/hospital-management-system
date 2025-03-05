// server/models/User.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
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
    phone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    // Additional fields if necessary
  },
  {
    sequelize,
    modelName: 'user',
  }
);

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    console.log('Before hashing, plaintext password:', user.password);
    const saltRounds = 10;
    const hashed = await bcrypt.hash(user.password, saltRounds);
    console.log('Hashed password:', hashed);
    user.password = hashed;
  } else {
    console.log('No password provided for user:', user.username);
  }
});

module.exports = User;
