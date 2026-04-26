const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Car = require('./Car');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  voitureId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  clientId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  date_debut: { type: DataTypes.DATEONLY, allowNull: false },
  date_fin:   { type: DataTypes.DATEONLY, allowNull: false },
  statut: { type: DataTypes.ENUM('en_attente','confirmee','annulee','terminee'), defaultValue: 'en_attente' },
  montant:  DataTypes.INTEGER.UNSIGNED,
  reference:{ type: DataTypes.STRING, unique: true }
}, {
  tableName: 'reservations',
  timestamps: true
});

Reservation.belongsTo(User, { as: 'client', foreignKey: 'clientId' });
Reservation.belongsTo(Car, { as: 'voiture', foreignKey: 'voitureId' });
Car.hasMany(Reservation, { as: 'reservations', foreignKey: 'voitureId' });
User.hasMany(Reservation, { as: 'reservations', foreignKey: 'clientId' });

module.exports = Reservation;
