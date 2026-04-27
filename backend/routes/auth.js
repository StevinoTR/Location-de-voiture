const express = require('express');
const { body } = require('express-validator');
const authCtrl = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('Email invalide.'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court.'),
], authCtrl.register);

router.post('/login', authCtrl.login);

module.exports = router;
