const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  prenom: { type: DataTypes.STRING, allowNull: false },
  nom:    { type: DataTypes.STRING, allowNull: false },
  email:  { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role:   { type: DataTypes.ENUM('client','entreprise','admin'), defaultValue: 'client' },
  blocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
