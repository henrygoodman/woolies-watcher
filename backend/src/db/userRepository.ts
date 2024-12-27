import { DBUser, DBUserSchema } from '@shared-types/db';
import pool from './pool';

/**
 * Find or create a user in the database.
 * @param email - The user's email.
 * @param name - The user's name (optional).
 * @returns The user object.
 */
export const findOrCreateUser = async (
  email: string,
  name?: string
): Promise<DBUser> => {
  const queryFind = `SELECT id, name, email, destination_email FROM users WHERE email = $1 LIMIT 1`;
  const queryCreate = `
    INSERT INTO users (email, name, destination_email)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, destination_email
  `;

  try {
    const result = await pool.query(queryFind, [email]);

    if (result.rows.length > 0) {
      return DBUserSchema.parse(result.rows[0]);
    }

    const insertResult = await pool.query(queryCreate, [email, name, email]);
    return DBUserSchema.parse(insertResult.rows[0]);
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
};

/**
 * Fetch the user's destination email.
 * @param userId - The user's ID.
 * @returns The destination email.
 */
export const getUserDestinationEmail = async (
  userId: number
): Promise<string> => {
  const query = `SELECT destination_email FROM users WHERE id = $1`;

  try {
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return result.rows[0].destination_email;
  } catch (error) {
    console.error('Error fetching destination email:', error);
    throw error;
  }
};

/**
 * Update the user's destination email.
 * @param userId - The user's ID.
 * @param destinationEmail - The new destination email.
 */
export const updateUserDestinationEmail = async (
  userId: number,
  destinationEmail: string
): Promise<void> => {
  const query = `UPDATE users SET destination_email = $1 WHERE id = $2`;

  try {
    await pool.query(query, [destinationEmail, userId]);
  } catch (error) {
    console.error('Error updating destination email:', error);
    throw error;
  }
};

/**
 * Save or update a user in the database.
 * @param user - The user object to save.
 * @returns The saved user object.
 */
export const saveUserToDB = async (user: Partial<DBUser>): Promise<DBUser> => {
  const query = `
    INSERT INTO users (email, name, destination_email)
    VALUES ($1, $2, $3)
    ON CONFLICT (email)
    DO UPDATE SET
      name = EXCLUDED.name,
      destination_email = EXCLUDED.destination_email
    RETURNING id, email, name, destination_email;
  `;

  try {
    const result = await pool.query(query, [
      user.email,
      user.name || null,
      user.destination_email || user.email,
    ]);

    return DBUserSchema.parse(result.rows[0]);
  } catch (error) {
    console.error('Error saving user to database:', error);
    throw error;
  }
};
