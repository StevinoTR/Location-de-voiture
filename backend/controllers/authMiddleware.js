const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Middleware obligatoire : bloque si pas de token valide
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant.' });
    }

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable.' });
    if (user.blocked) return res.status(403).json({ message: 'Compte bloqué.' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée.' });
    }
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

// Middleware optionnel : identifie l'utilisateur si token présent, sinon continue quand même
const softProtect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (user && !user.blocked) req.user = user;
  } catch (err) {
    // Token invalide ou expiré => on continue sans user
  }
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès refusé.' });
  }
  next();
};

module.exports = { protect, softProtect, authorize };
