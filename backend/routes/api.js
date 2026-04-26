const express = require('express');
const path = require('path');
const multer = require('multer');
const { body } = require('express-validator');
const router = express.Router();

const authCtrl = require('../controllers/authController');
const carCtrl = require('../controllers/carController');
const resaCtrl = require('../controllers/reservationController');
const entrepriseCtrl = require('../controllers/entrepriseController');
const userCtrl = require('../controllers/userController');

const { protect, authorize, softProtect } = require('../middleware/authMiddleware');

const upload = multer({ dest: path.join(__dirname, '../uploads') });

// Auth
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// Voitures
router.get('/voitures', softProtect, carCtrl.list);
router.post(
  '/voitures',
  protect,
  authorize('entreprise','admin'),
  [
    body('marque').notEmpty(),
    body('modele').notEmpty(),
    body('annee').isInt({ min: 1900, max: 2100 }),
    body('prix_jour').isInt({ gt: 0 }),
    body('statut').optional().isIn(['disponible','louee','maintenance'])
  ],
  carCtrl.create
);
router.put('/voitures/:id', protect, carCtrl.update);
router.delete('/voitures/:id', protect, carCtrl.remove);
router.post('/voitures/:id/photo', protect, upload.single('photo'), carCtrl.uploadPhoto);
router.get('/voitures/:id/photo', carCtrl.getPhoto);

// Reservations
router.post('/reservations', protect, resaCtrl.create);
router.get('/reservations', protect, resaCtrl.list);
router.get('/mes-reservations', protect, resaCtrl.myReservations);
router.get('/client/reservations', protect, resaCtrl.myReservations);
router.put('/reservations/:id', protect, resaCtrl.update);
router.put('/reservations/:id/confirm', protect, resaCtrl.confirm);
router.put('/reservations/:id/refuse', protect, resaCtrl.refuse);
router.put('/reservations/:id/terminate', protect, resaCtrl.terminate);
router.delete('/reservations/:id', protect, resaCtrl.remove);


// Users (admin)
router.get('/users', protect, authorize('admin'), userCtrl.list);
router.delete('/users/:id', protect, authorize('admin'), userCtrl.remove);
router.put('/users/:id/block', protect, authorize('admin'), userCtrl.toggleBlock);

// Entreprises
router.get('/entreprises', protect, authorize('admin'), entrepriseCtrl.list);
router.post('/entreprises', protect, authorize('admin'), entrepriseCtrl.create);
router.get('/entreprise/me', protect, authorize('entreprise'), entrepriseCtrl.me);

module.exports = router;
