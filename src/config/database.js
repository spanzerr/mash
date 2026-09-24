const { Pool } = require('pg');
const { env } = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err);
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function testDatabaseConnection() {
  try {
    await query('SELECT 1');
    console.log('PostgreSQL connection successful');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
  }
}

module.exports = {
  pool,
  query,
  withTransaction,
  testDatabaseConnection
};
