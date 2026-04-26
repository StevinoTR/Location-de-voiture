const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require('./config/db');
const User = require('./models/User');
const Car = require('./models/Car');
const Reservation = require('./models/Reservation');
const Entreprise = require('./models/Entreprise');
const Client = require('./models/Client');

async function clearData() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Delete all reservations and cars
    await Reservation.destroy({ where: {} });
    await Car.destroy({ where: {} });
    console.log('All reservations and cars deleted');

    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
}

clearData();
