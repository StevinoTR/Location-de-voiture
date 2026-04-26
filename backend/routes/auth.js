const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post(
  '/register',
  [
    body('prenom').notEmpty(),
    body('nom').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['client','entreprise']),
    body('adresse').optional().isString(),
    body('telephone').optional().isString(),
    body('nom_entreprise').optional().isString()
  ],
  authCtrl.register
);

router.post(
  '/login',
  [ body('email').isEmail(), body('password').notEmpty() ],
  authCtrl.login
);

module.exports = router;
