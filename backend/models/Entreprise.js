const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Entreprise = sequelize.define('Entreprise', {
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
  nom_entreprise: { type: DataTypes.STRING, allowNull: false },
  adresse: { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'entreprises',
  timestamps: true
});

Entreprise.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Entreprise, { foreignKey: 'userId', as: 'entreprise' });

module.exports = Entreprise;
