const { Pool } = require('pg');
const { env } = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err);
});

async function testDatabaseConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connection successful');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
  }
}

module.exports = {
  pool,
  testDatabaseConnection
};
