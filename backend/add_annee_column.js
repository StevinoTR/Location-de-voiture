const sequelize = require('./config/db');

const addAnneeColumn = async () => {
  try {
    await sequelize.authenticate();
    console.log('📊 Connexion à la base de données réussie');

    // Vérifier si la colonne existe déjà
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'voitures' 
      AND COLUMN_NAME = 'annee'
    `);

    if (results.length > 0) {
      console.log('✅ La colonne "annee" existe déjà dans la table voitures');
      process.exit(0);
    }

    // Ajouter la colonne annee
    await sequelize.query(`
      ALTER TABLE voitures 
      ADD COLUMN annee INT DEFAULT 2020 AFTER modele
    `);
    console.log('✅ Colonne "annee" ajoutée avec succès à la table voitures');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

addAnneeColumn();
