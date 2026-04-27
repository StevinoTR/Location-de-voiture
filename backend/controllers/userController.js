const User       = require('../models/User');
const Entreprise = require('../models/Entreprise');
const Client     = require('../models/Client');
const Car        = require('../models/Car');
const Reservation = require('../models/Reservation');

// GET /api/users
exports.list = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: Entreprise, as: 'entreprise' },
        { model: Client,     as: 'client' },
        { model: Car,        as: 'voitures',    attributes: ['id'] },
        { model: Reservation, as: 'reservations', attributes: ['id'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json(users);
  } catch (err) { next(err); }
};

// DELETE /api/users/:id
exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Impossible de supprimer un admin.' });
    await user.destroy();
    return res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) { next(err); }
};

// PUT /api/users/:id/block
exports.toggleBlock = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Impossible de bloquer un admin.' });
    await user.update({ blocked: user.blocked ? 0 : 1 });
    return res.json({ message: user.blocked ? 'Utilisateur bloqué.' : 'Utilisateur débloqué.', user });
  } catch (err) { next(err); }
};

// GET /api/entreprise/me
exports.entrepriseMe = async (req, res, next) => {
  try {
    const entreprise = await Entreprise.findOne({ where: { userId: req.user.id } });
    if (!entreprise) return res.status(404).json({ message: 'Entreprise introuvable.' });
    return res.json(entreprise);
  } catch (err) { next(err); }
};

// GET /api/entreprises
exports.entreprises = async (req, res, next) => {
  try {
    const list = await Entreprise.findAll({
      include: [{ model: require('../models/User'), as: 'user', attributes: ['id', 'email', 'blocked'] }]
    });
    return res.json(list);
  } catch (err) { next(err); }
};
