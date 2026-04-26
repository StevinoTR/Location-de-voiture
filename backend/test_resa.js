async function test() {
  try {
    const crypto = require('crypto');
    const email = crypto.randomBytes(4).toString('hex') + '@test.com';
    
    // 1. Create a user
    const regRes = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenom: 'Test',
        nom: 'Test',
        email: email,
        password: 'password123',
        role: 'client'
      })
    });
    const regData = await regRes.json();
    const token = regData.token;
    console.log('Registered, got token.');
    
    // Get a car
    const carsRes = await fetch('http://localhost:5000/api/voitures');
    const cars = await carsRes.json();
    if(cars.length === 0) { console.log('No cars available to test'); return; }
    
    const carId = cars[0].id;
    
    // Create reservation
    const createRes = await fetch('http://localhost:5000/api/reservations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        voitureId: carId,
        date_debut: '2026-05-01',
        date_fin: '2026-05-05'
      })
    });
    console.log('Reservation created:', await createRes.json());
    
    // 2. Request client reservations
    const getRes = await fetch('http://localhost:5000/api/client/reservations', {
      headers: { Authorization: 'Bearer ' + token }
    });
    
    if (!getRes.ok) {
      console.log('Error 500:', await getRes.text());
    } else {
      console.log('Success!', await getRes.json());
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
