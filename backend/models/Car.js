const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  marque:    { type: DataTypes.STRING, allowNull: false },
  modele:    { type: DataTypes.STRING, allowNull: false },
  annee:     { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
  prix_jour: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  statut:    { type: DataTypes.ENUM('disponible','louee','maintenance'), defaultValue: 'disponible' },
  description: DataTypes.TEXT,
  photoUrl:  DataTypes.STRING,
  // When an entreprise is deleted, we keep the car but clear the foreign key.
  entrepriseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  tableName: 'voitures',
  timestamps: true
});

// relation : la voiture appartient à une entreprise (utilisateur de type entreprise)
Car.belongsTo(User, {
  as: 'entreprise',
  foreignKey: { name: 'entrepriseId', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
User.hasMany(Car, {
  as: 'voitures',
  foreignKey: { name: 'entrepriseId', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

module.exports = Car;
