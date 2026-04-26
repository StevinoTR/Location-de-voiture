require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  },
  pool: {
    max:     5,
    min:     0,
    acquire: 60000,
    idle:    10000,
  }
});

sequelize.authenticate()
  .then(() => console.log('✅ Connexion DB OK'))
  .catch(err => console.error('❌ DB error:', err.message));

module.exports = sequelize;
