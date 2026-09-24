const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { encrypt, decrypt } = require('../utils/crypto');

const AUTH_URLS = {
  microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  google: 'https://accounts.google.com/o/oauth2/v2/auth'
};

async function listConnectors(organizationId) {
  const { rows } = await query(
    `SELECT * FROM connector_tokens WHERE organization_id = $1 ORDER BY created_at DESC`,
    [organizationId]
  );

  return rows.map((row) => ({
    ...row,
    decrypted_token: row.encrypted_token ? decrypt(row.encrypted_token) : null
  }));
}

function getAuthorizationUrl({ provider, organizationId, redirectUri }) {
  const state = `${organizationId}:${provider}:${uuidv4()}`;
  const params = new URLSearchParams({
    client_id: provider === 'microsoft' ? (process.env.M365_CLIENT_ID || 'demo') : (process.env.GOOGLE_CLIENT_ID || 'demo'),
    redirect_uri: redirectUri || 'http://localhost:4000/api/connectors/oauth/callback',
    response_type: 'code',
    state,
    scope: provider === 'microsoft' ? 'User.Read offline_access' : 'https://www.googleapis.com/auth/admin.reports.audit.readonly'
  });

  return `${AUTH_URLS[provider]}?${params.toString()}`;
}

async function saveConnectorToken({ organizationId, provider, code, redirectUri }) {
  const encrypted = encrypt(code || `demo-${provider}-${Date.now()}`);
  const { rows } = await query(
    `INSERT INTO connector_tokens (organization_id, connector_type, provider, encrypted_token, refresh_token, expires_at, metadata, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NULL, NULL, $5, NOW(), NOW())
     RETURNING *`,
    [organizationId, provider, provider, encrypted, JSON.stringify({ redirectUri, source: 'oauth' })]
  );

  return rows[0];
}

async function getReadOnlySnapshot({ organizationId, provider }) {
  const { rows } = await query(
    `SELECT * FROM connector_tokens WHERE organization_id = $1 AND provider = $2 ORDER BY created_at DESC LIMIT 1`,
    [organizationId, provider]
  );

  if (!rows[0]) {
    return { provider, status: 'not_connected', users: [], lastSync: null };
  }

  return {
    provider,
    status: 'connected',
    token: rows[0].encrypted_token ? 'stored' : 'missing',
    users: [
      { id: 'user-1', displayName: 'Compliance Lead', role: 'Admin' },
      { id: 'user-2', displayName: 'Security Analyst', role: 'Member' }
    ],
    lastSync: new Date().toISOString(),
    metadata: rows[0].metadata || {}
  };
}

module.exports = { listConnectors, getAuthorizationUrl, saveConnectorToken, getReadOnlySnapshot };
