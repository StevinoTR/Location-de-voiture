const path = require('path');
const fs   = require('fs');
const Car  = require('../models/Car');
const User = require('../models/User');
const Entreprise = require('../models/Entreprise');

// GET /api/voitures
exports.list = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.statut) where.statut = req.query.statut;

    const cars = await Car.findAll({
      where,
      include: [{
        model:      User,
        as:         'entreprise',
        attributes: ['id', 'prenom', 'nom'],
        include: [{
          model:      Entreprise,
          as:         'entreprise',
          attributes: ['nom_entreprise', 'telephone']
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    return res.json(cars);
  } catch (err) { next(err); }
};

// GET /api/voitures/:id
exports.get = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id, {
      include: [{
        model:      User,
        as:         'entreprise',
        attributes: ['id', 'prenom', 'nom'],
        include: [{
          model:      Entreprise,
          as:         'entreprise',
          attributes: ['nom_entreprise', 'telephone']
        }]
      }]
    });

    if (!car) return res.status(404).json({ message: 'Voiture introuvable.' });
    return res.json(car);
  } catch (err) { next(err); }
};

// POST /api/voitures
exports.create = async (req, res, next) => {
  try {
    const { marque, modele, annee, prix_jour, statut, description } = req.body;

    const car = await Car.create({
      entrepriseId: req.user.id,
      marque,
      modele,
      annee:       annee       || 2020,
      prix_jour,
      statut:      statut      || 'disponible',
      description: description || null,
      photoUrl:    null
    });

    return res.status(201).json(car);
  } catch (err) { next(err); }
};

// PUT /api/voitures/:id
exports.update = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable.' });

    if (req.user.role !== 'admin' && car.entrepriseId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    await car.update(req.body);
    return res.json(car);
  } catch (err) { next(err); }
};

// DELETE /api/voitures/:id
exports.remove = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable.' });

    if (req.user.role !== 'admin' && car.entrepriseId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    await car.destroy();
    return res.json({ message: 'Voiture supprimée.' });
  } catch (err) { next(err); }
};

// POST /api/voitures/:id/photo
exports.uploadPhoto = async (req, res, next) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable.' });

    if (!req.file) return res.status(400).json({ message: 'Aucun fichier envoyé.' });

    const ext      = path.extname(req.file.originalname).toLowerCase();
    const filename = `car_${car.id}_${Date.now()}${ext}`;
    const dest     = path.join(__dirname, '../uploads', filename);
    fs.renameSync(req.file.path, dest);

    await car.update({ photoUrl: `/uploads/${filename}` });
    return res.json({ photoUrl: `/uploads/${filename}` });
  } catch (err) { next(err); }
};
