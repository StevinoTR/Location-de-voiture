const Reservation = require('./models/Reservation');
const User = require('./models/User');
const Car = require('./models/Car');

async function test() {
  console.log('--- Testing Car.findAll ---');
  try {
    const cars = await Car.findAll({
      include: [{ association: 'entreprise', attributes: ['id', 'prenom', 'nom', 'email'] }]
    });
    console.log('Success! Found', cars.length, 'cars');
  } catch (err) {
    console.error('FAILED Car.findAll:', err);
  }

  console.log('\n--- Testing Reservation.findAll (myReservations style) ---');
  try {
    const user = await User.findOne({ where: { role: 'client' } });
    if (user) {
      const resas = await Reservation.findAll({
        where: { clientId: user.id },
        include: [
          { association: 'voiture', include: [{ association: 'entreprise', attributes: ['id','prenom','nom','email'] }] },
          { association: 'client', attributes: ['id','prenom','nom','email'] }
        ]
      });
      console.log('Success! Found', resas.length, 'reservations for', user.email);
    } else {
      console.log('No client found');
    }
  } catch (err) {
    console.error('FAILED Reservation.findAll:', err);
  }

  console.log('\n--- Testing User.findAll ---');
  try {
    const users = await User.findAll();
    console.log('Success! Found', users.length, 'users');
  } catch (err) {
    console.error('FAILED User.findAll:', err);
  }

  process.exit();
}

test();
