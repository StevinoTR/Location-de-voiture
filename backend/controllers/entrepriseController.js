const { validationResult } = require('express-validator');
const Entreprise = require('../models/Entreprise');
const User = require('../models/User');

exports.list = async (req, res, next) => {
  try {
    const entreprises = await Entreprise.findAll({ include: [{ model: User, as: 'user', attributes: ['id','prenom','nom','email'] }] });
    res.json(entreprises);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { userId, nom_entreprise, adresse, telephone } = req.body;
    const existing = await Entreprise.findOne({ where: { userId } });
    if (existing) return res.status(409).json({ message: 'Entreprise déjà enregistrée pour cet utilisateur' });

    const entreprise = await Entreprise.create({ userId, nom_entreprise, adresse, telephone });
    res.status(201).json(entreprise);
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const entreprise = await Entreprise.findOne({ where: { userId: req.user.id } });
    if (!entreprise) return res.status(404).json({ message: 'Entreprise introuvable' });
    res.json(entreprise);
  } catch (err) { next(err); }
};


