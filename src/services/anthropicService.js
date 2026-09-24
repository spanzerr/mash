const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { listConnectors, getAuthorizationUrl, saveConnectorToken, getReadOnlySnapshot } = require('../services/connectorService');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const connectors = await listConnectors(req.user.organization_id);
  return res.json({ connectors });
});

router.post('/oauth/start', requireRole(['admin']), async (req, res) => {
  const { provider, redirectUri } = req.body;
  if (!provider || !['microsoft', 'google'].includes(provider)) {
    return res.status(400).json({ error: 'provider must be microsoft or google.' });
  }

  const authUrl = getAuthorizationUrl({ provider, organizationId: req.user.organization_id, redirectUri });
  return res.json({ authorizationUrl: authUrl });
});

router.post('/oauth/callback', requireRole(['admin']), async (req, res) => {
  const { provider, code } = req.body;
  if (!provider || !code) {
    return res.status(400).json({ error: 'provider and code are required.' });
  }

  const connector = await saveConnectorToken({
    organizationId: req.user.organization_id,
    provider,
    code,
    redirectUri: 'http://localhost:4000/api/connectors/oauth/callback'
  });

  return res.status(201).json({ connector });
});

router.get('/:provider/snapshot', async (req, res) => {
  const snapshot = await getReadOnlySnapshot({
    organizationId: req.user.organization_id,
    provider: req.params.provider
  });

  return res.json(snapshot);
});

module.exports = router;
