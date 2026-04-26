const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const entrepriseCtrl = require('../controllers/entrepriseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), entrepriseCtrl.list);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('userId').isInt({ gt: 0 }),
    body('nom_entreprise').notEmpty(),
    body('adresse').notEmpty(),
    body('telephone').optional().isString()
  ],
  entrepriseCtrl.create
);

module.exports = router;
