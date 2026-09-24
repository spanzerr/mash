const express = require('express');
const { query } = require('../config/database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM organizations WHERE id = $1 LIMIT 1`,
    [req.user.organization_id]
  );

  return res.json({ organization: rows[0] || null });
});

router.get('/team', async (req, res) => {
  const { rows } = await query(
    `SELECT id, organization_id, email, full_name, role, is_active, created_at
     FROM users
     WHERE organization_id = $1
     ORDER BY created_at DESC`,
    [req.user.organization_id]
  );

  return res.json({ users: rows });
});

router.get('/invitations', requireRole(['admin']), async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM invitations WHERE organization_id = $1 ORDER BY created_at DESC`,
    [req.user.organization_id]
  );

  return res.json({ invitations: rows });
});

router.post('/invitations', requireRole(['admin']), async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const token = require('uuid').v4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const { rows } = await query(
      `INSERT INTO invitations (organization_id, email, role, token, status, invited_by, expires_at, created_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, NOW())
       RETURNING *`,
      [req.user.organization_id, String(email).toLowerCase(), role, token, req.user.id, expiresAt]
    );

    return res.status(201).json({ invitation: rows[0] });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
