const sequelize = require('./config/db');

const addPhotoColumn = async () => {
  try {
    await sequelize.authenticate();
    console.log('📊 Connexion à la base de données réussie');

    // Vérifier si la colonne photoUrl existe déjà
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'voitures' 
      AND COLUMN_NAME IN ('photourl', 'photoUrl', 'photo_url')
    `);

    if (results.length > 0) {
      console.log('✅ La colonne photo existe déjà');
      console.log('Colonnes trouvées:', results.map(r => r.COLUMN_NAME));
      process.exit(0);
    }

    // Ajouter la colonne photoUrl
    await sequelize.query(`
      ALTER TABLE voitures 
      ADD COLUMN photourl VARCHAR(255) DEFAULT NULL AFTER description
    `);
    console.log('✅ Colonne "photourl" ajoutée avec succès à la table voitures');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

addPhotoColumn();
