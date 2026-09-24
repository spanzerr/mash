const express = require('express');
const { query } = require('../config/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateDocumentDraft } = require('../services/anthropicService');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM documents WHERE organization_id = $1 ORDER BY created_at DESC`,
    [req.user.organization_id]
  );

  return res.json({ documents: rows });
});

router.post('/generate', async (req, res) => {
  const { assessmentId, documentType = 'ssp' } = req.body;

  const assessmentRes = await query(
    `SELECT * FROM assessments WHERE id = $1 AND organization_id = $2 LIMIT 1`,
    [assessmentId, req.user.organization_id]
  );

  if (!assessmentRes.rows[0]) {
    return res.status(404).json({ error: 'Assessment not found.' });
  }

  const draft = await generateDocumentDraft({
    documentType,
    assessment: assessmentRes.rows[0],
    organizationName: req.organization.name
  });

  const { rows } = await query(
    `INSERT INTO documents (organization_id, document_type, title, content, status, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'draft', $5, NOW(), NOW())
     RETURNING *`,
    [req.user.organization_id, documentType, draft.title, draft.content, req.user.id]
  );

  return res.status(201).json({ document: rows[0] });
});

router.post('/:documentId/review', requireRole(['admin']), async (req, res) => {
  const { rows } = await query(
    `UPDATE documents
     SET status = 'reviewed', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $2 AND organization_id = $3
     RETURNING *`,
    [req.user.id, req.params.documentId, req.user.organization_id]
  );

  if (!rows[0]) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  return res.json({ document: rows[0] });
});

router.post('/:documentId/finalize', requireRole(['admin']), async (req, res) => {
  const { rows } = await query(
    `UPDATE documents
     SET status = 'final', updated_at = NOW()
     WHERE id = $1 AND organization_id = $2 AND reviewed_by IS NOT NULL
     RETURNING *`,
    [req.params.documentId, req.user.organization_id]
  );

  if (!rows[0]) {
    return res.status(400).json({ error: 'Document must be reviewed before it can be finalized.' });
  }

  return res.json({ document: rows[0] });
});

module.exports = router;
