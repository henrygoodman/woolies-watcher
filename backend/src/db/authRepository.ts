import pool from './pool';

export const findOrCreateUser = async (email: string, name?: string) => {
  const queryFind = `SELECT id FROM users WHERE email = $1 LIMIT 1`;
  const queryCreate = `
        INSERT INTO users (email, name)
        VALUES ($1, $2)
        RETURNING id
    `;

  try {
    const result = await pool.query(queryFind, [email]);
    if (result.rows.length > 0) {
      return result.rows[0].id as number;
    }

    const insertResult = await pool.query(queryCreate, [email, name]);
    return insertResult.rows[0].id as number;
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
};
