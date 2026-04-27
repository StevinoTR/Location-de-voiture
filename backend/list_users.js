const User = require('./models/User');
const Client = require('./models/Client');
const Entreprise = require('./models/Entreprise');
const sequelize = require('./config/db');

const listUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('📊 Connexion à la base de données réussie\n');

    const users = await User.findAll({
      order: [['id', 'ASC']]
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données.');
    } else {
      console.log(`👥 ${users.length} utilisateur(s) trouvé(s):\n`);
      console.log('─'.repeat(80));
      console.log('ID  | RÔLE        | EMAIL                    | NOM               | PRÉNOM    | BLOQUÉ | MOT DE PASSE (hash)');
      console.log('─'.repeat(80));

      users.forEach(user => {
        const id = String(user.id).padEnd(3);
        const role = user.role.padEnd(11);
        const email = (user.email || '').substring(0, 24).padEnd(24);
        const nom = (user.nom || '-').substring(0, 17).padEnd(17);
        const prenom = (user.prenom || '-').substring(0, 9).padEnd(9);
        const blocked = user.blocked ? 'OUI' : 'NON';
        const passwordHash = (user.password || '').substring(0, 30) + '...';
        console.log(`${id} | ${role} | ${email} | ${nom} | ${prenom} | ${blocked} | ${passwordHash}`);
      });

      console.log('─'.repeat(80));
      console.log('\n📋 Détails par rôle:\n');

      const clients = users.filter(u => u.role === 'client');
      const entreprises = users.filter(u => u.role === 'entreprise');
      const admins = users.filter(u => u.role === 'admin');

      console.log(`👤 Clients: ${clients.length}`);
      if (clients.length > 0) {
        clients.forEach(c => {
          console.log(`   - ${c.email} (${c.prenom} ${c.nom})`);
        });
      }

      console.log(`\n🏢 Entreprises: ${entreprises.length}`);
      if (entreprises.length > 0) {
        entreprises.forEach(e => {
          console.log(`   - ${e.email} (${e.prenom} ${e.nom})`);
        });
      }

      console.log(`\n🔐 Admins: ${admins.length}`);
      if (admins.length > 0) {
        admins.forEach(a => {
          console.log(`   - ${a.email} (${a.prenom} ${a.nom})`);
        });
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

listUsers();
