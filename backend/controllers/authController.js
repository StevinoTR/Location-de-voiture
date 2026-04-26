const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Client = require('../models/Client');
const Entreprise = require('../models/Entreprise');
require('dotenv').config();

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { prenom, nom, email, password, role, telephone, adresse, nom_entreprise } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      prenom,
      nom,
      email,
      password: hash,
      role: role === 'entreprise' ? 'entreprise' : 'client'
    });

    // Create the profile record based on the role
    if (user.role === 'entreprise') {
      await Entreprise.create({
        userId: user.id,
        nom_entreprise: nom_entreprise || `${prenom} ${nom}`,
        adresse: adresse || '',
        telephone: telephone || ''
      });
    } else {
      await Client.create({
        userId: user.id,
        adresse: adresse || '',
        telephone: telephone || ''
      });
    }

    const token = signToken(user);
    const entreprise = user.role === 'entreprise'
      ? await Entreprise.findOne({ where: { userId: user.id } })
      : null;

    res.status(201).json({
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        role: user.role,
        blocked: user.blocked,
        entreprise: entreprise ? {
          id: entreprise.id,
          nom_entreprise: entreprise.nom_entreprise,
          adresse: entreprise.adresse,
          telephone: entreprise.telephone
        } : null
      }
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });

    if (user.blocked) {
      return res.status(403).json({ message: "Votre compte a été bloqué. Contactez l'administrateur." });
    }

    const token = signToken(user);
    const entreprise = user.role === 'entreprise'
      ? await Entreprise.findOne({ where: { userId: user.id } })
      : null;

    res.json({
      token,
      user: {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        role: user.role,
        blocked: user.blocked,
        entreprise: entreprise ? {
          id: entreprise.id,
          nom_entreprise: entreprise.nom_entreprise,
          adresse: entreprise.adresse,
          telephone: entreprise.telephone
        } : null
      }
    });
  } catch (err) { next(err); }
};
