const Reservation = require('./models/Reservation');
const Car = require('./models/Car');
const User = require('./models/User');

async function test() {
  try {
    const resas = await Reservation.findAll({
      include: [
        { association: 'voiture' },
        { association: 'client' }
      ]
    });
    console.log('Total reservations:', resas.length);
    resas.forEach(r => {
      console.log(`Resa ${r.id}: Client ${r.clientId}, Car ${r.voitureId}, Status ${r.statut}`);
    });
  } catch (err) {
    console.error('Error fetching all resas:', err);
  }
  process.exit();
}

test();
