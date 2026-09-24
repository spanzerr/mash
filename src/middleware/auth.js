const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { env } = require('../config/env');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const { rows } = await query(
      `SELECT u.*, o.name AS organization_name, o.slug AS organization_slug
       FROM users u
       JOIN organizations o ON o.id = u.organization_id
       WHERE u.id = $1`,
      [decoded.sub]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = rows[0];
    req.organization = {
      id: rows[0].organization_id,
      name: rows[0].organization_name,
      slug: rows[0].organization_slug
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function requireRole(roles = []) {
  return function (req, res, next) {
    const role = req.user?.role || 'member';
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
