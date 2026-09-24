const { query } = require('../config/database');

async function writeAudit({ organizationId, userId, eventType, entityType, entityId, details = {} }) {
  await query(
    `INSERT INTO audit_log (organization_id, user_id, event_type, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [organizationId, userId || null, eventType, entityType || null, entityId || null, JSON.stringify(details)]
  );
}

module.exports = { writeAudit };
