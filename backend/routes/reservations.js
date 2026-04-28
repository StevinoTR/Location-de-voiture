const express = require('express');
const resaCtrl = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',              resaCtrl.create);
router.get('/',   protect, authorize('entreprise','admin'), resaCtrl.list);
router.get('/mes-reservations', protect, resaCtrl.mesReservations);
router.get('/client/reservations', protect, resaCtrl.mesReservations);
router.put('/:id',            protect, resaCtrl.update);
router.put('/:id/confirm',    protect, authorize('entreprise','admin'), resaCtrl.confirm);
router.put('/:id/refuse',     protect, authorize('entreprise','admin'), resaCtrl.refuse);
router.put('/:id/terminate',  protect, authorize('entreprise','admin'), resaCtrl.terminate);
router.put('/:id/cancel',     protect, resaCtrl.cancel);

module.exports = router;
