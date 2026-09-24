const express = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM evidence WHERE organization_id = $1 ORDER BY created_at DESC`,
    [req.user.organization_id]
  );

  return res.json({ evidence: rows });
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, fileUrl, sourceType = 'manual' } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const { rows } = await query(
      `INSERT INTO evidence (organization_id, title, description, file_url, source_type, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [req.user.organization_id, title, description || '', fileUrl || null, sourceType, req.user.id]
    );

    return res.status(201).json({ evidence: rows[0] });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
