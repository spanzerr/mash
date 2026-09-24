const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, withTransaction } = require('../config/database');
const { env } = require('../config/env');
const { writeAudit } = require('../utils/audit');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, org: user.organization_id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, organizationName } = req.body;

    if (!fullName || !email || !password || !organizationName) {
      return res.status(400).json({ error: 'fullName, email, password, and organizationName are required.' });
    }

    await withTransaction(async (client) => {
      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'organization';

      const orgResult = await client.query(
        `INSERT INTO organizations (name, slug, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING *`,
        [organizationName, slug]
      );

      const passwordHash = await bcrypt.hash(password, 12);
      const userResult = await client.query(
        `INSERT INTO users (organization_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'admin', true, NOW(), NOW())
         RETURNING id, organization_id, email, full_name, role, is_active`,
        [orgResult.rows[0].id, String(email).toLowerCase(), passwordHash, fullName]
      );

      const user = userResult.rows[0];
      await writeAudit({
        organizationId: orgResult.rows[0].id,
        userId: user.id,
        eventType: 'user_registered',
        entityType: 'organization',
        entityId: orgResult.rows[0].id,
        details: { organizationName }
      });

      const token = signToken({ ...user, organization_id: orgResult.rows[0].id });
      return res.status(201).json({
        token,
        user: { ...user, organization_id: orgResult.rows[0].id },
        organization: orgResult.rows[0]
      });
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { rows } = await query(
      `SELECT u.*, o.name AS organization_name, o.slug AS organization_slug
       FROM users u
       JOIN organizations o ON o.id = u.organization_id
       WHERE LOWER(u.email) = LOWER($1) AND u.is_active = true`,
      [email]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = signToken(user);
    await writeAudit({
      organizationId: user.organization_id,
      userId: user.id,
      eventType: 'user_login',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email }
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: user.organization_name,
        organization_slug: user.organization_slug
      },
      organization: {
        id: user.organization_id,
        name: user.organization_name,
        slug: user.organization_slug
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      role: req.user.role,
      organization_id: req.user.organization_id,
      organization_name: req.organization.name,
      organization_slug: req.organization.slug
    }
  });
});

router.post('/invitations', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const token = uuidv4();
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

router.post('/invitations/accept', requireAuth, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required.' });
    }

    const { rows } = await query(
      `SELECT * FROM invitations WHERE token = $1 AND status = 'pending' LIMIT 1`,
      [token]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Invitation not found or already used.' });
    }

    const invitation = rows[0];
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Invitation has expired.' });
    }

    const { rows: userRows } = await query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [req.user.email]
    );

    if (!userRows[0]) {
      return res.status(400).json({ error: 'Your user account is not yet a member of the organization.' });
    }

    await query(
      `UPDATE invitations SET status = 'accepted' WHERE id = $1`,
      [invitation.id]
    );

    await query(
      `UPDATE users SET organization_id = $1, role = $2, updated_at = NOW() WHERE id = $3`,
      [invitation.organization_id, invitation.role, userRows[0].id]
    );

    return res.json({ message: 'Invitation accepted successfully.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
