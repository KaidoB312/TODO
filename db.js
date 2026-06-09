var { Pool } = require('pg');
require('dotenv').config();

var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`).catch(function (err) {
  console.error('Failed to create table:', err.message);
});

module.exports = pool;
