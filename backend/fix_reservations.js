const sequelize = require('./config/db');
const Reservation = require('./models/Reservation');
const User = require('./models/User');

async function fixReservations() {
  try {
    console.log('🔄 Mise à jour des réservations existantes...');

    // Trouver toutes les réservations qui ont un clientId mais pas de nom_client
    const reservations = await Reservation.findAll({
      where: {
        clientId: { [require('sequelize').Op.ne]: null },
        nom_client: { [require('sequelize').Op.or]: [{ [require('sequelize').Op.eq]: null }, { [require('sequelize').Op.eq]: '' }] }
      },
      include: [{ model: User, as: 'client', attributes: ['prenom', 'nom', 'email'] }]
    });

    console.log(`📋 Trouvé ${reservations.length} réservations à mettre à jour`);

    for (const resa of reservations) {
      if (resa.client) {
        await resa.update({
          nom_client: `${resa.client.prenom} ${resa.client.nom}`,
          email_client: resa.client.email
        });
        console.log(`✅ Mise à jour réservation ${resa.id}: ${resa.nom_client}`);
      }
    }

    console.log('🎉 Mise à jour terminée !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
}

fixReservations()