require('dotenv').config();
const { Sequelize } = require('sequelize');

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT
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
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
);

module.exports = sequelize;
