const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Car  = require('./Car');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  voitureId: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field:     'voiture_id'
  },
  clientId: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field:     'client_id'
  },
<<<<<<< HEAD
  reference:    { type: DataTypes.STRING,  unique: true,   allowNull: true },
=======
  reference:    { type: DataTypes.STRING,  unique: true,    allowNull: true },
>>>>>>> 5c5205a (fix: modeles compatibles TiDB BIGINT)
  date_debut:   { type: DataTypes.DATEONLY, allowNull: false },
  date_fin:     { type: DataTypes.DATEONLY, allowNull: false },
  statut:       { type: DataTypes.STRING,  allowNull: false, defaultValue: 'en_attente' },
  montant:      { type: DataTypes.INTEGER, allowNull: true },
  nb_jours:     { type: DataTypes.INTEGER, allowNull: true },
  nom_client:   { type: DataTypes.STRING,  allowNull: true },
  email_client: { type: DataTypes.STRING,  allowNull: true },
  tel_client:   { type: DataTypes.STRING,  allowNull: true },
  cin_client:   { type: DataTypes.STRING,  allowNull: true },
  lieu:         { type: DataTypes.STRING,  allowNull: true },
  message:      { type: DataTypes.TEXT,    allowNull: true }
}, {
  tableName:  'reservations',
  timestamps: true
});

Reservation.belongsTo(User, {
  as:         'client',
  foreignKey: { name: 'clientId', field: 'client_id' }
});
Reservation.belongsTo(Car, {
  as:         'voiture',
  foreignKey: { name: 'voitureId', field: 'voiture_id' }
});
Car.hasMany(Reservation, {
  as:         'reservations',
  foreignKey: { name: 'voitureId', field: 'voiture_id' }
});
User.hasMany(Reservation, {
  as:         'reservations',
  foreignKey: { name: 'clientId', field: 'client_id' }
});

module.exports = Reservation;
