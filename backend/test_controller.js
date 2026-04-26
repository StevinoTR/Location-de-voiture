const reservationController = require('./controllers/reservationController');
const User = require('./models/User');

async function test() {
  const user = await User.findOne({ where: { role: 'client' } });
  if (!user) {
    console.log('No client found');
    process.exit();
  }

  const req = {
    user: user,
    params: {},
    query: {}
  };

  const res = {
    json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
    status: (code) => {
      console.log('Status code:', code);
      return res;
    }
  };

  const next = (err) => {
    console.error('Next called with error:', err);
  };

  console.log('--- Testing myReservations ---');
  await reservationController.myReservations(req, res, next);

  process.exit();
}

test();
