const sequelize = require('./config/db');
const Reservation = require('./models/Reservation');

async function listReservations() {
  try {
    const reservations = await Reservation.findAll({
      attributes: ['id', 'clientId', 'nom_client', 'email_client', 'reference'],
      limit: 10,
      order: [['id', 'DESC']]
    });

    console.log('📋 Réservations récentes:');
    reservations.forEach(r => {
      console.log(`ID: ${r.id}, ClientID: ${r.clientId}, Nom: ${r.nom_client || 'NULL'}, Ref: ${r.reference}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
}

listReservations();