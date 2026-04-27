require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixSchema() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  
  console.log(`Connecting to database ${DB_NAME} on ${DB_HOST}...`);
  
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT || 3306,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: {}
    });

    console.log('✔ Connected.');

    // Check if 'blocked' column exists in 'users' table
    const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE 'blocked'`);

    if (columns.length === 0) {
      console.log('Column "blocked" is missing. Adding it...');
      await connection.query(`ALTER TABLE users ADD COLUMN blocked TINYINT(1) NOT NULL DEFAULT 0`);
      console.log('✔ Column "blocked" added successfully.');
    } else {
      console.log('✔ Column "blocked" already exists.');
    }

    await connection.end();
    console.log('Done.');
  } catch (err) {
    console.error('❌ Failed to fix schema:', err.message);
    process.exit(1);
  }
}

fixSchema();
