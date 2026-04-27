const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  prenom:   { type: DataTypes.STRING, allowNull: true },
  nom:      { type: DataTypes.STRING, allowNull: true },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role:     { type: DataTypes.STRING, allowNull: false, defaultValue: 'client' },
  blocked:  { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 }
}, {
  tableName:  'users',
<<<<<<< HEAD
  timestamps: true
=======
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
>>>>>>> 2e18c38848e12645d2e436016d19f9c58171ec7e
});

module.exports = User;
