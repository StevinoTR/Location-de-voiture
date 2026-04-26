const express = require('express');
const { body } = require('express-validator');
const resaCtrl = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, resaCtrl.list);
router.get('/mes-reservations', protect, resaCtrl.myReservations);

router.post(
  '/',
  protect,
  [
    body('voitureId').isInt({ gt: 0 }),
    body('date_debut').isISO8601(),
    body('date_fin').isISO8601()
  ],
  resaCtrl.create
);

router.put('/:id', protect, resaCtrl.update);
router.delete('/:id', protect, resaCtrl.remove);

module.exports = router;
