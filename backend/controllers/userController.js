const User = require('../models/User');
const Client = require('../models/Client');
const Entreprise = require('../models/Entreprise');
const Car = require('../models/Car');
const Reservation = require('../models/Reservation');

exports.list = async (req, res, next) => {
  try {
    const { role } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: Client, as: 'client' },
        { model: Entreprise, as: 'entreprise' },
        { model: Car, as: 'voitures' },
        { model: Reservation, as: 'reservations' }
      ]
    });

    res.json(users);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });

    // Delete dependent records manually to prevent foreign key constraint errors
    if (user.role === 'client') {
      await Reservation.destroy({ where: { clientId: user.id } });
      await Client.destroy({ where: { userId: user.id } });
    } else if (user.role === 'entreprise') {
      const cars = await Car.findAll({ where: { entrepriseId: user.id } });
      const carIds = cars.map(c => c.id);
      if (carIds.length > 0) {
        await Reservation.destroy({ where: { voitureId: carIds } });
        await Car.destroy({ where: { entrepriseId: user.id } });
      }
      await Entreprise.destroy({ where: { userId: user.id } });
    }

    await user.destroy();
    res.status(204).end();
  } catch (err) { next(err); }
};

exports.toggleBlock = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Impossible de bloquer/débloquer un administrateur' });

    user.blocked = !user.blocked;
    await user.save();

    res.json({ id: user.id, blocked: user.blocked });
  } catch (err) { next(err); }
};
