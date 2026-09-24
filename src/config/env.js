const env = {
  PORT: Number(process.env.PORT || 4000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cmmc_readiness_dev',
  JWT_SECRET: process.env.JWT_SECRET || 'local-dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  M365_CLIENT_ID: process.env.M365_CLIENT_ID || '',
  M365_CLIENT_SECRET: process.env.M365_CLIENT_SECRET || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'
};

module.exports = { env };
