const express  = require('express');
const multer   = require('multer');
const { body } = require('express-validator');
const carCtrl  = require('../controllers/carController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/',    carCtrl.list);
router.get('/:id', carCtrl.get);

router.post('/',
  protect,
  authorize('entreprise', 'admin'),
  [
    body('marque').notEmpty().withMessage('Marque requise.'),
    body('modele').notEmpty().withMessage('Modèle requis.'),
    body('prix_jour').isInt({ gt: 0 }).withMessage('Prix invalide.'),
  ],
  carCtrl.create
);

router.put('/:id',    protect, carCtrl.update);
router.delete('/:id', protect, carCtrl.remove);
router.post('/:id/photo', protect, upload.single('photo'), carCtrl.uploadPhoto);

module.exports = router;
