const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Car = require('../models/Car');

exports.list = async (req, res, next) => {
  try {
    const { minPrix, maxPrix, statut, marque, modele } = req.query;
    const where = {};

    if (minPrix) where.prix_jour = { ...(where.prix_jour || {}), [Op.gte]: Number(minPrix) };
    if (maxPrix) where.prix_jour = { ...(where.prix_jour || {}), [Op.lte]: Number(maxPrix) };
    if (statut) where.statut = statut;
    if (marque) where.marque = { [Op.like]: `%${marque}%` };
    if (modele) where.modele = { [Op.like]: `%${modele}%` };

    // Filter by entreprise only in dashboard mode (no statut filter = private dashboard call)
    // When statut=disponible is passed, it's the public catalogue — show all companies' cars
    if (req.user && req.user.role === 'entreprise' && !statut) {
      where.entrepriseId = req.user.id;
    }

    const cars = await Car.findAll({
      where,
      include: [
        'entreprise',
        {
          association: 'reservations',
          required: false,
          where: { statut: { [Op.notIn]: ['annulee', 'terminee'] } },
          include: [{ association: 'client', attributes: ['id','prenom','nom','email'] }]
        }
      ]
    });
    res.json(cars);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable' });
    res.json(car);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { marque, modele, annee, prix_jour, statut, description, photoUrl } = req.body;
    const car = await Car.create({
      marque,
      modele,
      annee,
      prix_jour,
      statut: statut || 'disponible',
      description,
      photoUrl,
      entrepriseId: req.user.id
    });
    res.status(201).json(car);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable' });
    if (car.entrepriseId !== req.user.id)
      return res.status(403).json({ message: 'Interdit' });

    await car.update(req.body);
    res.json(car);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable' });
    if (car.entrepriseId !== req.user.id)
      return res.status(403).json({ message: 'Interdit' });
    await car.destroy();
    res.status(204).end();
  } catch (err) { next(err); }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable' });
    if (car.entrepriseId !== req.user.id)
      return res.status(403).json({ message: 'Interdit' });

    if (!req.file) return res.status(400).json({ message: 'Aucune photo fournie' });

    // store filename for serving
    car.photoUrl = req.file.filename;
    await car.save();

    res.json({ message: 'Photo uploadée', photoUrl: `/voitures/${car.id}/photo` });
  } catch (err) { next(err); }
};

exports.getPhoto = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car || !car.photoUrl) return res.status(404).json({ message: 'Photo introuvable' });

    const path = require('path');
    const filePath = path.join(__dirname, '..', 'uploads', car.photoUrl);
    res.sendFile(filePath);
  } catch (err) { next(err); }
};
