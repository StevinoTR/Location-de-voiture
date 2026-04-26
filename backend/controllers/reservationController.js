const { validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Car = require('../models/Car');

exports.list = async (req, res, next) => {
  try {
    let where = {};
    const include = [
      { association: 'voiture', include: [{ association: 'entreprise', attributes: ['id','prenom','nom','email'] }] },
      { association: 'client', attributes: ['id','prenom','nom','email'] }
    ];

    if (req.user.role === 'client') {
      where.clientId = req.user.id;
    } else if (req.user.role === 'entreprise') {
      // entreprise sees reservations for its own cars
      const resas = await Reservation.findAll({
        where,
        include: [{
          association: 'voiture',
          where: { entrepriseId: req.user.id },
          include: [{ association: 'entreprise', attributes: ['id','prenom','nom','email'] }]
        }, { association: 'client', attributes: ['id','prenom','nom','email'] }]
      });
      return res.json(resas);
    }

    const resas = await Reservation.findAll({ where, include });
    res.json(resas);
  } catch (err) { next(err); }
};

exports.myReservations = async (req, res, next) => {
  try {
    const resas = await Reservation.findAll({
      where: { clientId: req.user.id },
      include: [
        { association: 'voiture', include: [{ association: 'entreprise', attributes: ['id','prenom','nom','email'] }] },
        { association: 'client', attributes: ['id','prenom','nom','email'] }
      ]
    });
    res.json(resas);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { voitureId, date_debut, date_fin } = req.body;
    // ensure dates are valid (end after start)
    if (new Date(date_fin) <= new Date(date_debut)) {
      return res.status(422).json({ message: 'La date de fin doit être postérieure à la date de début' });
    }
    const car = await Car.findByPk(voitureId);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable' });

    const jours = (new Date(date_fin) - new Date(date_debut)) / 86400000;
    const montant = Math.round(jours * car.prix_jour);

    const reference = 'R' + Math.floor(1000 + Math.random()*9000);

    const resa = await Reservation.create({
      voitureId,
      clientId: req.user.id,
      date_debut,
      date_fin,
      montant,
      reference
    });

    res.status(201).json(resa);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id, { include: [{ association: 'voiture' }] });
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable' });

    if (req.user.role === 'client' && resa.clientId !== req.user.id) {
      return res.status(403).json({ message: 'Interdit' });
    }

    if (req.user.role === 'entreprise') {
      if (!resa.voiture || resa.voiture.entrepriseId !== req.user.id) {
        return res.status(403).json({ message: 'Interdit' });
      }
      // entreprise can only update statut for validation flow
      if (req.body.statut && ['confirmee','annulee','terminee','en_attente'].includes(req.body.statut)) {
        await resa.update({ statut: req.body.statut });
        return res.json(resa);
      }
      return res.status(400).json({ message: 'Statut invalide' });
    }

    // admin and client cannot directement modifier la réservation par cette route
    return res.status(403).json({ message: 'Interdit' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id);
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable' });

    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Interdit' });
    }

    if (req.user.role === 'client') {
      if (resa.clientId !== req.user.id) return res.status(403).json({ message: 'Interdit' });
      await resa.destroy();
      return res.status(204).end();
    }

    // entreprise n'a pas le droit de supprimer une réservation via API
    return res.status(403).json({ message: 'Interdit' });
  } catch (err) { next(err); }
};

exports.confirm = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id, { include: [{ association: 'voiture' }] });
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable' });

    if (req.user.role === 'entreprise') {
      if (!resa.voiture || resa.voiture.entrepriseId !== req.user.id) {
        return res.status(403).json({ message: 'Interdit' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Interdit' });
    }

    await resa.update({ statut: 'confirmee' });
    res.json(resa);
  } catch (err) { next(err); }
};

exports.refuse = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id, { include: [{ association: 'voiture' }] });
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable' });

    if (req.user.role === 'entreprise') {
      if (!resa.voiture || resa.voiture.entrepriseId !== req.user.id) {
        return res.status(403).json({ message: 'Interdit' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Interdit' });
    }

    await resa.update({ statut: 'annulee' });
    res.json(resa);
  } catch (err) { next(err); }
};

exports.terminate = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id, { include: [{ association: 'voiture' }] });
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable' });

    // Only the entreprise that owns the car can terminate
    if (req.user.role === 'entreprise') {
      if (!resa.voiture || resa.voiture.entrepriseId !== req.user.id) {
        return res.status(403).json({ message: 'Interdit' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Interdit' });
    }

    // 1. Mark reservation as terminated
    await resa.update({ statut: 'terminee' });

    // 2. Set car back to available
    if (resa.voiture) {
      await resa.voiture.update({ statut: 'disponible' });
    }

    res.json({ message: 'Réservation terminée, voiture remise disponible', reservation: resa });
  } catch (err) { next(err); }
};
