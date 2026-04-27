const sequelize = require('./config/db');

const checkColumns = async () => {
  try {
    await sequelize.authenticate();
    console.log('📊 Connexion à la base de données réussie\n');

    // Colonnes attendues selon le modèle Car.js
    const expectedColumns = [
      'id',
      'entreprise_id',
      'marque',
      'modele',
      'annee',
      'prix_jour',
      'statut',
      'description',
      'photourl',
      'created_at',
      'updated_at'
    ];

    // Récupérer les colonnes actuelles
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'voitures'
      ORDER BY ORDINAL_POSITION
    `);

    const actualColumns = results.map(r => r.COLUMN_NAME.toLowerCase());

    console.log('📋 Colonnes actuelles dans la table voitures:');
    actualColumns.forEach(col => console.log(`   ✓ ${col}`));

    console.log('\n🔍 Vérification des colonnes manquantes:');
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col.toLowerCase()));

    if (missingColumns.length === 0) {
      console.log('   ✅ Toutes les colonnes sont présentes');
    } else {
      console.log('   ❌ Colonnes manquantes:');
      missingColumns.forEach(col => console.log(`      - ${col}`));
    }

    console.log('\n🔍 Colonnes supplémentaires (non attendues):');
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
    if (extraColumns.length === 0) {
      console.log('   ✅ Aucune colonne supplémentaire');
    } else {
      extraColumns.forEach(col => console.log(`      - ${col}`));
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

checkColumns();
