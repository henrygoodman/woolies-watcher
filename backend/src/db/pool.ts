import { Pool, types } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

types.setTypeParser(1700, (val) => parseFloat(val)); // NUMERIC

export default pool;
