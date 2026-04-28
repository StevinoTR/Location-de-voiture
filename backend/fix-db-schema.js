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

    // Check and add missing columns in 'users' table
    const columnsToCheck = ['blocked', 'created_at', 'updated_at'];
    
    for (const colName of columnsToCheck) {
      const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE ?`, [colName]);
      
      if (columns.length === 0) {
        let alterSQL;
        if (colName === 'blocked') {
          alterSQL = `ALTER TABLE users ADD COLUMN blocked TINYINT(1) NOT NULL DEFAULT 0`;
        } else if (colName === 'created_at') {
          alterSQL = `ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        } else if (colName === 'updated_at') {
          alterSQL = `ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
        }
        
        console.log(`Column "${colName}" is missing. Adding it...`);
        await connection.query(alterSQL);
        console.log(`✔ Column "${colName}" added successfully.`);
      } else {
        console.log(`✔ Column "${colName}" already exists.`);
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
