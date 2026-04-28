const sequelize = require('./config/db');

const fixTimestampColumns = async () => {
  try {
    await sequelize.authenticate();
    console.log('📊 Connexion à la base de données réussie');

    const tableName = 'voitures';
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable(tableName);

    if (columns.createdat && !columns.created_at) {
      await sequelize.query(`
        ALTER TABLE ${tableName}
        CHANGE COLUMN createdat created_at TIMESTAMP NULL DEFAULT NULL
      `);
      console.log('✅ Colonne "createdat" renommée en "created_at"');
    } else if (columns.created_at) {
      console.log('ℹ️  La colonne "created_at" existe déjà, aucune action nécessaire');
    } else {
      console.log('⚠️  Aucune colonne "createdat" trouvée à renommer');
    }

    if (columns.updatedat && !columns.updated_at) {
      await sequelize.query(`
        ALTER TABLE ${tableName}
        CHANGE COLUMN updatedat updated_at TIMESTAMP NULL DEFAULT NULL
      `);
      console.log('✅ Colonne "updatedat" renommée en "updated_at"');
    } else if (columns.updated_at) {
      console.log('ℹ️  La colonne "updated_at" existe déjà, aucune action nécessaire');
    } else {
      console.log('⚠️  Aucune colonne "updatedat" trouvée à renommer');
    }

    console.log('\n✅ Colonnes timestamp corrigées avec succès');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

fixTimestampColumns();
