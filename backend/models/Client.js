const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field:     'user_id'
  },
  telephone: { type: DataTypes.STRING, allowNull: true },
  adresse:   { type: DataTypes.STRING, allowNull: true }
}, {
  tableName:  'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Client.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id' }, as: 'user' });
User.hasOne(Client,    { foreignKey: { name: 'userId', field: 'user_id' }, as: 'client' });

module.exports = Client;
