require('dotenv').config();
const path    = require('path');
const express = require('express');
const cors    = require('cors');

const sequelize = require('./config/db');

// Import models (ordre important)
require('./models/User');
require('./models/Client');
require('./models/Entreprise');
require('./models/Car');
require('./models/Reservation');

// Import routes
const authRoutes  = require('./routes/auth');
const carRoutes   = require('./routes/cars');
const resaRoutes  = require('./routes/reservations');
const userRoutes  = require('./routes/users');

const app = express();

// CORS
app.use(cors({
  origin:      process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods:     ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir le frontend
const frontendPath = path.join(__dirname, '../Frontend');
app.use(express.static(frontendPath));

// Routes API
app.use('/api/auth',         authRoutes);
app.use('/api/voitures',     carRoutes);
app.use('/api/reservations', resaRoutes);
app.use('/api/users',        userRoutes);

// Routes raccourcies (pour app.js frontend)
app.use('/api', authRoutes);
app.use('/api', resaRoutes);
app.use('/api', userRoutes);

// Health check
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Fallback HTML
app.get('/*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), err => {
    if (err) res.status(404).json({ message: 'Page introuvable.' });
  });
});

// Gestion erreurs globale
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${req.method} ${req.path}`, err.message);
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur.' });
});

// Démarrage
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✔ Connexion à la base de données réussie.');

    const port = parseInt(process.env.PORT) || 5000;
    app.listen(port, () => {
      console.log(`🚀 Serveur démarré sur : http://localhost:${port}`);
      console.log(`📡 API Base : http://localhost:${port}/api`);
    });
  } catch (err) {
    console.error('❌ Impossible de démarrer :', err.message);
    process.exit(1);
  }
};

start();
