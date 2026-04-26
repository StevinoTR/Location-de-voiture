const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  marque:      { type: DataTypes.STRING,        allowNull: false },
  modele:      { type: DataTypes.STRING,        allowNull: false },
  annee:       { type: DataTypes.INTEGER,       allowNull: true  },
  prix_jour:   { type: DataTypes.INTEGER,       allowNull: false },
  statut:      { type: DataTypes.STRING,        allowNull: false, defaultValue: 'disponible' },
  description: { type: DataTypes.TEXT,          allowNull: true  },
  photoUrl:    { type: DataTypes.STRING,        allowNull: true  },
  entrepriseId: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field:     'entreprise_id'    // ← mappe vers la colonne en BDD
  }
}, {
  tableName:  'voitures',
  timestamps: true
});

Car.belongsTo(User, {
  as:         'entreprise',
  foreignKey: { name: 'entrepriseId', field: 'entreprise_id', allowNull: false }
});

User.hasMany(Car, {
  as:         'voitures',
  foreignKey: { name: 'entrepriseId', field: 'entreprise_id', allowNull: false }
});

module.exports = Car;