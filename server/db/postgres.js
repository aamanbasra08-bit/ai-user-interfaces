const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'crypto_insight_hub',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create subscribers table if it doesn't exist
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('PostgreSQL: Subscribers table ready');
  } catch (error) {
    console.error('PostgreSQL initialization error:', error);
  }
};

// Initialize on module load
initDatabase();

module.exports = pool;
