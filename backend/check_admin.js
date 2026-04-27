const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Client = require('./models/Client');
const Entreprise = require('./models/Entreprise');
const sequelize = require('./config/db');

const checkUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('Cleaning up old admin accounts and linked profiles...');
    const adminEmails = ['admin@carrent.mg', 'admin@carrent.local'];
    const usersToDelete = await User.findAll({ where: { email: adminEmails } });
    const userIds = usersToDelete.map(u => u.id);

    if (userIds.length > 0) {
      await require('./models/Reservation').destroy({ where: { clientId: userIds } });
      await Client.destroy({ where: { userId: userIds } });
      await Entreprise.destroy({ where: { userId: userIds } });
      await User.destroy({ where: { id: userIds } });
    }

    console.log('Creating fresh admin account...');
    const hash = await bcrypt.hash('admin123', 12);
    await User.create({
      prenom: 'Admin',
      nom: 'System',
      email: 'admin@carrent.mg',
      password: hash,
      role: 'admin'
    });
    console.log('Admin account recreated: admin@carrent.mg / admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();
