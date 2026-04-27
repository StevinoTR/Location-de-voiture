const sequelize = require('./config/db');

const fixTimestampColumns = async () => {
  try {
    await sequelize.authenticate();
    console.log('📊 Connexion à la base de données réussie');

    // Renommer createdat en created_at
    await sequelize.query(`
      ALTER TABLE voitures 
      CHANGE COLUMN createdat created_at TIMESTAMP NULL DEFAULT NULL
    `);
    console.log('✅ Colonne "createdat" renommée en "created_at"');

    // Renommer updatedat en updated_at
    await sequelize.query(`
      ALTER TABLE voitures 
      CHANGE COLUMN updatedat updated_at TIMESTAMP NULL DEFAULT NULL
    `);
    console.log('✅ Colonne "updatedat" renommée en "updated_at"');

    console.log('\n✅ Colonnes timestamp corrigées avec succès');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

fixTimestampColumns();
