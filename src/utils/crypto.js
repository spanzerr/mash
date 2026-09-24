const { query } = require('../config/database');

const DOMAIN_MAP = {
  AC: 'Access Control',
  AT: 'Awareness and Training',
  AU: 'Audit and Accountability',
  CM: 'Configuration Management',
  IA: 'Identification and Authentication',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PE: 'Physical Protection',
  PS: 'Personnel Security',
  RA: 'Risk Assessment',
  SA: 'System and Services Acquisition',
  SC: 'System and Communications Protection',
  SI: 'System and Information Integrity'
};

const DEFAULT_PRACTICES = [
  { domainCode: 'AC', practiceCode: 'AC.1', title: 'Access control policy and procedure' },
  { domainCode: 'AT', practiceCode: 'AT.1', title: 'Security awareness training' },
  { domainCode: 'AU', practiceCode: 'AU.1', title: 'Audit logging and monitoring' },
  { domainCode: 'CM', practiceCode: 'CM.1', title: 'Baseline configuration management' },
  { domainCode: 'IA', practiceCode: 'IA.1', title: 'Identification and authentication' },
  { domainCode: 'IR', practiceCode: 'IR.1', title: 'Incident response plan' },
  { domainCode: 'MA', practiceCode: 'MA.1', title: 'Maintenance processes' },
  { domainCode: 'MP', practiceCode: 'MP.1', title: 'Media protection' },
  { domainCode: 'PE', practiceCode: 'PE.1', title: 'Physical protection' },
  { domainCode: 'PS', practiceCode: 'PS.1', title: 'Personnel security' },
  { domainCode: 'RA', practiceCode: 'RA.1', title: 'Risk assessment' },
  { domainCode: 'SA', practiceCode: 'SA.1', title: 'System acquisition' },
  { domainCode: 'SC', practiceCode: 'SC.1', title: 'Boundary protection' },
  { domainCode: 'SI', practiceCode: 'SI.1', title: 'System integrity monitoring' }
];

async function ensureAssessmentPractices(assessmentId) {
  const { rows } = await query(
    `SELECT * FROM practice_statuses WHERE assessment_id = $1 LIMIT 1`,
    [assessmentId]
  );

  if (rows.length > 0) {
    return rows;
  }

  const inserts = DEFAULT_PRACTICES.map(() => '(?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
  const values = [];

  for (const practice of DEFAULT_PRACTICES) {
    values.push(
      assessmentId,
      practice.domainCode,
      practice.practiceCode,
      'not_started',
      'manual',
      practice.title,
      null
    );
  }

  await query(
    `INSERT INTO practice_statuses (assessment_id, domain_code, practice_code, status, source, notes, last_reviewed_by, created_at, updated_at)
     VALUES ${DEFAULT_PRACTICES.map(() => '($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())').join(', ')}`,
    values
  );

  const refreshed = await query(
    `SELECT * FROM practice_statuses WHERE assessment_id = $1 ORDER BY domain_code, practice_code`,
    [assessmentId]
  );

  return refreshed.rows;
}

module.exports = { DOMAIN_MAP, DEFAULT_PRACTICES, ensureAssessmentPractices };
