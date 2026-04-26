const Reservation = require('../models/Reservation');
const Car         = require('../models/Car');
const User        = require('../models/User');
const Client      = require('../models/Client');

const generateRef = () =>
  'R' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);

// POST /api/reservations
exports.create = async (req, res, next) => {
  try {
    const {
      voitureId, date_debut, date_fin,
      nom_client, email_client, tel_client, cin_client, lieu, message
    } = req.body;

    const car = await Car.findByPk(voitureId);
    if (!car) return res.status(404).json({ message: 'Voiture introuvable.' });
    if (car.statut !== 'disponible') {
      return res.status(409).json({ message: 'Voiture non disponible.' });
    }

    const d1      = new Date(date_debut);
    const d2      = new Date(date_fin);
    const nb_jours = Math.ceil((d2 - d1) / 86400000);
    const montant  = nb_jours * car.prix_jour;

    let reference = generateRef();
    let exists    = await Reservation.findOne({ where: { reference } });
    while (exists) { reference = generateRef(); exists = await Reservation.findOne({ where: { reference } }); }

    const clientId = req.user ? req.user.id : null;

    const resa = await Reservation.create({
      voitureId,
      clientId,
      reference,
      date_debut,
      date_fin,
      nb_jours,
      montant,
      nom_client,
      email_client,
      tel_client,
      cin_client,
      lieu:    lieu    || null,
      message: message || null,
    });

    await car.update({ statut: 'louee' });

    return res.status(201).json({ message: 'Réservation créée.', reference, reservation: resa });
  } catch (err) { next(err); }
};

// GET /api/reservations
exports.list = async (req, res, next) => {
  try {
    const where = {};

    if (req.user.role === 'entreprise') {
      const cars = await Car.findAll({ where: { entrepriseId: req.user.id }, attributes: ['id'] });
      where.voitureId = cars.map(c => c.id);
    }

    const resas = await Reservation.findAll({
      where,
      include: [
        { model: Car,  as: 'voiture', attributes: ['id', 'marque', 'modele', 'photoUrl'] },
        { model: User, as: 'client',  attributes: ['id', 'prenom', 'nom', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(resas);
  } catch (err) { next(err); }
};

// GET /api/mes-reservations
exports.mesReservations = async (req, res, next) => {
  try {
    const resas = await Reservation.findAll({
      where: { clientId: req.user.id },
      include: [
        { model: Car, as: 'voiture', attributes: ['id', 'marque', 'modele', 'photoUrl', 'prix_jour'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(resas);
  } catch (err) { next(err); }
};

// PUT /api/reservations/:id
exports.update = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id);
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable.' });
    await resa.update(req.body);
    return res.json(resa);
  } catch (err) { next(err); }
};

// PUT /api/reservations/:id/confirm
exports.confirm = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id);
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable.' });
    await resa.update({ statut: 'confirmee' });
    return res.json({ message: 'Réservation confirmée.', reservation: resa });
  } catch (err) { next(err); }
};

// PUT /api/reservations/:id/refuse
exports.refuse = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id, { include: [{ model: Car, as: 'voiture' }] });
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable.' });
    await resa.update({ statut: 'annulee' });
    if (resa.voiture) await resa.voiture.update({ statut: 'disponible' });
    return res.json({ message: 'Réservation refusée.', reservation: resa });
  } catch (err) { next(err); }
};

// PUT /api/reservations/:id/terminate
exports.terminate = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id, { include: [{ model: Car, as: 'voiture' }] });
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable.' });
    await resa.update({ statut: 'terminee' });
    if (resa.voiture) await resa.voiture.update({ statut: 'disponible' });
    return res.json({ message: 'Réservation terminée.', reservation: resa });
  } catch (err) { next(err); }
};

// PUT /api/reservations/:id/cancel
exports.cancel = async (req, res, next) => {
  try {
    const resa = await Reservation.findByPk(req.params.id, { include: [{ model: Car, as: 'voiture' }] });
    if (!resa) return res.status(404).json({ message: 'Réservation introuvable.' });
    await resa.update({ statut: 'annulee' });
    if (resa.voiture) await resa.voiture.update({ statut: 'disponible' });
    return res.json({ message: 'Réservation annulée.', reservation: resa });
  } catch (err) { next(err); }
};
