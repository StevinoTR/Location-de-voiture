require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 4000,
    dialect: 'mysql',
    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },

    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
);

// 🔐 Test connexion
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK');
  } catch (error) {
    console.error('❌ DB error:', error.message);
    process.exit(1);
  }
})();

module.exports = sequelize;