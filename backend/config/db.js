require('dotenv').config();
const { Sequelize } = require('sequelize');

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_SSL
} = process.env;

if (!DB_NAME || !DB_USER) {
  console.warn('Missing required database environment variables (DB_NAME/DB_USER).');
}

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST || 'localhost',
    port: DB_PORT ? parseInt(DB_PORT, 10) : 3306,
    dialect: 'mysql',
    logging: false,

    // 🔐 Activation SSL
    dialectOptions: DB_SSL === 'true' ? {
      ssl: {
        
        rejectUnauthorized: true 
      }
    } : {},

    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
);

// ✅ Fonction de vérification de connexion
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
}

// 🔁 Test automatique au démarrage
testConnection();

module.exports = sequelize;