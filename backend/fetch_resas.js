const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/client/reservations',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE3NzcyMDQ0NDJ9.w1lEWUhmVgiinN1h3NRN-Y1YHCjfqp8Ja-K_pbOtK7Q'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
