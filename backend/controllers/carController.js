const path = require('path');
const fs   = require('fs');
const Car  = require('../models/Car');
const User = require('../models/User');
const Entreprise = require('../models/Entreprise');
const cloudinary = require('../config/cloudinary');

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
          as:         'entrepriseInfo',
          attributes: ['nom_entreprise', 'telephone']
        }]
      }],
      order: [['id', 'DESC']]
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

    // Vérifier que c'est bien une image
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Supprimer le fichier temporaire
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.' });
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Fichier trop volumineux. Maximum 5MB.' });
    }

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'carrent/cars',
        public_id: `car_${car.id}_${Date.now()}`,
        resource_type: 'auto',
        overwrite: true
      });

      // Supprimer l'ancienne photo de Cloudinary si elle existe
      if (car.photoUrl && car.photoUrl.includes('cloudinary')) {
        try {
          // Extraire le public_id de l'URL Cloudinary
          const urlParts = car.photoUrl.split('/');
          const oldPublicId = urlParts[urlParts.length - 1].split('.')[0];
          await cloudinary.uploader.destroy(`carrent/cars/${oldPublicId}`);
        } catch (err) {
          console.warn('Impossible de supprimer l\'ancienne photo Cloudinary:', err.message);
        }
      }

      // Nettoyer le fichier temporaire
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      await car.update({ photoUrl: result.secure_url });
      return res.json({ photoUrl: result.secure_url });
    } catch (cloudinaryErr) {
      // Nettoyer le fichier temporaire en cas d'erreur
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Erreur Cloudinary:', cloudinaryErr);
      return res.status(500).json({ message: 'Erreur lors de l\'upload: ' + cloudinaryErr.message });
    }
  } catch (err) {
    // Nettoyer le fichier temporaire en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};
