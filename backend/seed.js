require('dotenv').config();
const bcrypt    = require('bcryptjs');
const sequelize = require('./config/db');
const User      = require('./models/User');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion BDD OK');

    const email    = process.env.ADMIN_EMAIL    || 'admin@carrent.mg';
    const password = process.env.ADMIN_PASSWORD || 'Admin2026!';

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('ℹ️  Admin existe déjà :', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 12);
    await User.create({
      prenom:   'Super',
      nom:      'Admin',
      email,
      password: hash,
      role:     'admin',
      blocked:  0
    });

    console.log('✅ Compte admin créé !');
    console.log('   Email    :', email);
    console.log('   Password :', password);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
}

seed();
