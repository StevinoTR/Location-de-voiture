require('dotenv').config();
const { Sequelize } = require('sequelize');

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT
} = process.env;

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT ? parseInt(DB_PORT, 10) : 4000, // ⚠️ important
    dialect: 'mysql',
    logging: false,

    // 🔐 AJOUT IMPORTANT (SSL)
    dialectOptions: {
      ssl: {
        require: true,
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    },

    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
);

// ✅ TEST + BLOQUER SI ECHEC
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB sécurisée réussie');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :', error.message);
    process.exit(1); // 🔴 IMPORTANT
  }
})();

module.exports = sequelize;