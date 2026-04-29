const express  = require('express');
const resaCtrl = require('../controllers/reservationController');
const { protect, softProtect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// POST : softProtect => identifie le client si connecté (clientId non null)
router.post('/',             softProtect, resaCtrl.create);

// GET liste (entreprise/admin seulement)
router.get('/',   protect, authorize('entreprise', 'admin'), resaCtrl.list);

// GET réservations du client connecté
router.get('/mes-reservations',    protect, resaCtrl.mesReservations);
router.get('/client/reservations', protect, resaCtrl.mesReservations);

// Actions sur une réservation
router.put('/:id',            protect, resaCtrl.update);
router.put('/:id/confirm',    protect, authorize('entreprise', 'admin'), resaCtrl.confirm);
router.put('/:id/refuse',     protect, authorize('entreprise', 'admin'), resaCtrl.refuse);
router.put('/:id/terminate',  protect, authorize('entreprise', 'admin'), resaCtrl.terminate);
router.put('/:id/cancel',     protect, resaCtrl.cancel);

module.exports = router;
