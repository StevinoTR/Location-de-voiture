const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'user_id'
  },
  telephone: { type: DataTypes.STRING, allowNull: true },
  adresse: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'clients',
  timestamps: true
});

Client.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Client, { foreignKey: 'userId', as: 'client' });

module.exports = Client;
