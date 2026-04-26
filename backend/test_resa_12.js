const Reservation = require('./models/Reservation');

async function test() {
  try {
    const r = await Reservation.findByPk(12, {
      include: [
        { association: 'voiture', include: [{ association: 'entreprise', attributes: ['id','prenom','nom','email'] }] },
        { association: 'client', attributes: ['id','prenom','nom','email'] }
      ]
    });
    console.log('Success! Resa 12 fetched with includes');
    console.log('Client:', r.client ? r.client.email : 'NULL');
    console.log('Voiture:', r.voiture ? r.voiture.modele : 'NULL');
    console.log('Entreprise:', (r.voiture && r.voiture.entreprise) ? r.voiture.entreprise.email : 'NULL');
  } catch (err) {
    console.error('FAILED fetching Resa 12:', err);
  }
  process.exit();
}

test();
