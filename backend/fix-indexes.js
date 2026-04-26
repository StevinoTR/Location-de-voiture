require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    const [rows] = await conn.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'users'
         AND INDEX_NAME LIKE 'email_%'`
    );

    if (rows.length === 0) {
      console.log('No duplicate email indexes found.');
      await conn.end();
      return;
    }

    for (const row of rows) {
      console.log(`Dropping index: ${row.INDEX_NAME}`);
      await conn.query(`ALTER TABLE users DROP INDEX \`${row.INDEX_NAME}\``);
    }

    console.log('Duplicate email indexes removed successfully.');
    await conn.end();
  } catch (err) {
    console.error('Failed to remove duplicate indexes:', err);
    process.exit(1);
  }
})();
