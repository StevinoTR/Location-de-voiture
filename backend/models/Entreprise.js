const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Entreprise = sequelize.define('Entreprise', {
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
  nom_entreprise: { type: DataTypes.STRING, allowNull: false },
  adresse:        { type: DataTypes.STRING, allowNull: true },
  telephone:      { type: DataTypes.STRING, allowNull: true }
}, {
  tableName:  'entreprises',
<<<<<<< HEAD
  timestamps: true
=======
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
>>>>>>> 2e18c38848e12645d2e436016d19f9c58171ec7e
});

Entreprise.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id' }, as: 'user' });
User.hasOne(Entreprise,    { foreignKey: { name: 'userId', field: 'user_id' }, as: 'entreprise' });

module.exports = Entreprise;
