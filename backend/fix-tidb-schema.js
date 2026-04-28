require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixTiDBSchema() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found. Please check your .env file.');
    console.log('Expected format: DATABASE_URL=mysql://user:pass@host:port/database');
    process.exit(1);
  }

  console.log('🔗 Connecting to TiDB...');

  try {
    const connection = await mysql.createConnection({
      uri: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('✅ Connected to TiDB!');

    // SQL commands to add missing columns
    const sqlCommands = [
      `ALTER TABLE voitures ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE voitures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE entreprises ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked TINYINT(1) NOT NULL DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
    ];

    console.log('🔧 Applying schema fixes...');

    for (const sql of sqlCommands) {
      try {
        await connection.query(sql);
        console.log(`✅ Executed: ${sql.split('ADD COLUMN')[1]?.trim() || sql}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`ℹ️  Column already exists, skipping: ${sql.split('ADD COLUMN')[1]?.trim()}`);
        } else {
          console.error(`❌ Error executing: ${sql}`);
          console.error(`   ${err.message}`);
        }
      }
    }

    await connection.end();
    console.log('\n🎉 Schema migration completed successfully!');
    console.log('Your TiDB database is now ready for the CarRent application.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Failed to connect or execute migration:', err.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure TiDB cluster is running and accessible');
    console.log('3. Verify your credentials are correct');
    console.log('4. Check if your IP is whitelisted in TiDB Cloud');
    process.exit(1);
  }
}

fixTiDBSchema();