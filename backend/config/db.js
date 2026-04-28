require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelizeOptions = {
  dialect: 'mysql',
  logging: false,
  define: {
    underscored:     false,
    freezeTableName: false,
    createdAt:       'createdAt',
    updatedAt:       'updatedAt'
  },
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  pool: {
    max:     5,
    min:     0,
    acquire: 60000,
    idle:    10000,
  }
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, sequelizeOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
        ...sequelizeOptions,
      }
    );

module.exports = sequelize;