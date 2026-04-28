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

    // Tables et leurs colonnes manquantes
    const tables = ['users', 'voitures', 'reservations', 'clients', 'entreprises'];
    const columnsToCheck = {
      'users': ['blocked', 'created_at', 'updated_at'],
      'voitures': ['created_at', 'updated_at'],
      'reservations': ['created_at', 'updated_at'],
      'clients': ['created_at', 'updated_at'],
      'entreprises': ['created_at', 'updated_at']
    };

    for (const table of tables) {
      console.log(`\nChecking table: ${table}`);
      const columns = columnsToCheck[table];
      
      for (const colName of columns) {
        const [existing] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [colName]);
        
        if (existing.length === 0) {
          let alterSQL;
          if (colName === 'blocked') {
            alterSQL = `ALTER TABLE ${table} ADD COLUMN blocked TINYINT(1) NOT NULL DEFAULT 0`;
          } else if (colName === 'created_at') {
            alterSQL = `ALTER TABLE ${table} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
          } else if (colName === 'updated_at') {
            alterSQL = `ALTER TABLE ${table} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
          }
          
          console.log(`  Column "${colName}" is missing. Adding it...`);
          await connection.query(alterSQL);
          console.log(`  ✔ Column "${colName}" added successfully.`);
        } else {
          console.log(`  ✔ Column "${colName}" already exists.`);
        }
      }
    }

    await connection.end();
    console.log('Done.');
  } catch (err) {
    console.error('❌ Failed to fix schema:', err.message);
    process.exit(1);
  }
}

fixSchema();
