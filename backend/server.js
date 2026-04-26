require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Op } = require('sequelize');
const sequelize = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 2. API ROUTES (Must come before static files)
app.use('/api', apiRoutes);
console.log('API routes loaded');

// 3. STATIC FILES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../Frontend')));

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 4. CLEAN URL REDIRECTS (Friendly paths for the browser)
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../Frontend/dashboard.html')));
app.get('/client-dashboard', (req, res) => res.sendFile(path.join(__dirname, '../Frontend/client_dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../Frontend/admin.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../Frontend/connexion.html')));

// 5. 404 FALLBACK
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route introuvable', 
    path: req.originalUrl,
    method: req.method 
  });
});

// 6. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 7. AUTO-UPDATE CAR STATUS BASED ON RESERVATION DATES
const updateCarStatusBasedOnReservations = async () => {
  try {
    const Car = require('./models/Car');
    const Reservation = require('./models/Reservation');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Find all active reservations where today falls within date_debut and date_fin
    const activeResas = await Reservation.findAll({
      where: {
        statut: { [Op.in]: ['confirmee', 'en_attente'] },
        date_debut: { [Op.lte]: today },
        date_fin: { [Op.gte]: today }
      }
    });

    if (activeResas.length > 0) {
      const voitureIds = [...new Set(activeResas.map(resa => resa.voitureId))];
      await Car.update(
        { statut: 'louee' },
        { where: { id: { [Op.in]: voitureIds }, statut: 'disponible' } }
      );
      console.log(`✔ ${voitureIds.length} voiture(s) mise(s) à jour en "louee" (rented)`);
    }
  } catch (err) {
    console.error('Erreur lors de la mise à jour automatique des statuts :', err.stack || err.message);
  }
};

// Run the check every hour
setInterval(updateCarStatusBasedOnReservations, 3600000); // 1 hour

// 8. START SERVER
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔ Connexion à la base de données réussie.');
  } catch (e) {
    console.error('⚠️  Connexion à la base de données échouée, mais le serveur démarre quand même :', e.message);
  }

  // sync is disabled to prevent crashes due to FK constraints
  // await sequelize.sync({ alter: false });

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur : http://localhost:${port}`);
    console.log(`📡 API Base : http://localhost:${port}/api`);
    
    // Initial status check
    updateCarStatusBasedOnReservations();
    console.log('✔ Vérification initiale des statuts complétée');
  });
};

start();
