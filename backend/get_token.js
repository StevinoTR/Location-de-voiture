const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

async function test() {
  const user = await User.findOne({ where: { email: 'client@carrent.mg' } });
  if (!user) {
    console.log('User not found');
    process.exit();
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  console.log('TOKEN:', token);
  process.exit();
}
test();
