const express = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM poam_items WHERE organization_id = $1 ORDER BY due_date ASC NULLS LAST`,
    [req.user.organization_id]
  );

  return res.json({ poamItems: rows });
});

router.post('/', async (req, res) => {
  const { title, owner, dueDate, status = 'open', progressPct = 0, description = '' } = req.body;
  if (!title || !owner) {
    return res.status(400).json({ error: 'title and owner are required.' });
  }

  const { rows } = await query(
    `INSERT INTO poam_items (organization_id, title, owner, due_date, status, progress_pct, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [req.user.organization_id, title, owner, dueDate ? new Date(dueDate) : null, status, Number(progressPct), description]
  );

  return res.status(201).json({ poamItem: rows[0] });
});

module.exports = router;
