require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const User = require('./models/User');
const Entreprise = require('./models/Entreprise');
const Client = require('./models/Client');
const Car = require('./models/Car');
const Reservation = require('./models/Reservation');

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER,
  DB_PASSWORD,
  DB_NAME = 'carrent'
} = process.env;

const createDatabaseIfNeeded = async () => {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.end();
};

const formatDate = (date) => date.toISOString().split('T')[0];

const restoreData = async () => {
  await createDatabaseIfNeeded();
  console.log(`Database created or already exists: ${DB_NAME}`);

  await sequelize.authenticate();
  console.log('Connected to MySQL successfully.');

  await sequelize.sync({ alter: true });
  console.log('Database schema synchronized.');

  const [admin] = await User.findOrCreate({
    where: { email: 'admin@carrent.mg' },
    defaults: {
      prenom: 'Admin',
      nom: 'System',
      email: 'admin@carrent.mg',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin'
    }
  });

  const [entrepriseUser] = await User.findOrCreate({
    where: { email: 'entreprise@carrent.mg' },
    defaults: {
      prenom: 'Pierre',
      nom: 'Rakoto',
      email: 'entreprise@carrent.mg',
      password: await bcrypt.hash('entreprise123', 12),
      role: 'entreprise'
    }
  });

  await Entreprise.findOrCreate({
    where: { userId: entrepriseUser.id },
    defaults: {
      userId: entrepriseUser.id,
      nom_entreprise: 'CarRent MG',
      adresse: 'Antananarivo, Madagascar',
      telephone: '+261 34 12 345 67'
    }
  });

  const [clientUser] = await User.findOrCreate({
    where: { email: 'client@carrent.mg' },
    defaults: {
      prenom: 'Jean',
      nom: 'Andrian',
      email: 'client@carrent.mg',
      password: await bcrypt.hash('client123', 12),
      role: 'client'
    }
  });

  await Client.findOrCreate({
    where: { userId: clientUser.id },
    defaults: {
      userId: clientUser.id,
      telephone: '+261 34 98 765 43',
      adresse: 'Antananarivo'
    }
  });

  const cars = [
    {
      marque: 'Toyota',
      modele: 'Corolla',
      annee: 2022,
      prix_jour: 65000,
      statut: 'disponible',
      description: 'Compacte fiable, parfaite pour la ville.',
      photoUrl: '/uploads/default-toyota.jpg',
      entrepriseId: entrepriseUser.id
    },
    {
      marque: 'Renault',
      modele: 'Kwid',
      annee: 2021,
      prix_jour: 55000,
      statut: 'disponible',
      description: 'Économique et pratique pour les trajets courts.',
      photoUrl: '/uploads/default-renault.jpg',
      entrepriseId: entrepriseUser.id
    }
  ];

  for (const carData of cars) {
    await Car.findOrCreate({
      where: {
        entrepriseId: carData.entrepriseId,
        marque: carData.marque,
        modele: carData.modele
      },
      defaults: carData
    });
  }

  const voiture = await Car.findOne({ where: { entrepriseId: entrepriseUser.id } });
  if (voiture) {
    const today = formatDate(new Date());
    const tomorrow = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

    await Reservation.findOrCreate({
      where: {
        clientId: clientUser.id,
        voitureId: voiture.id,
        date_debut: today
      },
      defaults: {
        clientId: clientUser.id,
        voitureId: voiture.id,
        date_debut: today,
        date_fin: tomorrow,
        statut: 'confirmee',
        montant: voiture.prix_jour,
        reference: `RESA-${Date.now()}`
      }
    });
  }

  console.log('Sample users, entreprise, cars, and reservation created.');
  console.log('Restore complete.');
};

restoreData().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
