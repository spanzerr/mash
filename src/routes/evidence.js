const express = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { ensureAssessmentPractices } = require('../utils/assessment');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM assessments WHERE organization_id = $1 ORDER BY created_at DESC`,
    [req.user.organization_id]
  );

  return res.json({ assessments: rows });
});

router.post('/', async (req, res) => {
  const { name = 'New assessment' } = req.body;
  const { rows } = await query(
    `INSERT INTO assessments (organization_id, name, status, created_by, created_at, updated_at)
     VALUES ($1, $2, 'draft', $3, NOW(), NOW())
     RETURNING *`,
    [req.user.organization_id, name, req.user.id]
  );

  const assessment = rows[0];
  await ensureAssessmentPractices(assessment.id);

  return res.status(201).json({ assessment });
});

router.get('/:assessmentId', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM assessments WHERE id = $1 AND organization_id = $2 LIMIT 1`,
    [req.params.assessmentId, req.user.organization_id]
  );

  if (!rows[0]) {
    return res.status(404).json({ error: 'Assessment not found.' });
  }

  const practices = await ensureAssessmentPractices(rows[0].id);
  return res.json({ assessment: rows[0], practices });
});

module.exports = router;
