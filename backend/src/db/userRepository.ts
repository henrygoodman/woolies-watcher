import { UserConfig } from '@shared-types/api';
import pool from './pool';

const DEFAULT_USER_CONFIG: UserConfig = {
  notificationTime: '8am AEST',
  destinationEmail: '',
};

export const findOrCreateUser = async (email: string, name?: string) => {
  const queryFind = `SELECT id FROM users WHERE email = $1 LIMIT 1`;
  const queryCreate = `
    INSERT INTO users (email, name)
    VALUES ($1, $2)
    RETURNING id
  `;

  try {
    const result = await pool.query(queryFind, [email]);
    let userId: number;

    if (result.rows.length > 0) {
      userId = result.rows[0].id;

      const existingConfigQuery = `
        SELECT COUNT(*) FROM user_config WHERE user_id = $1
      `;
      const configResult = await pool.query(existingConfigQuery, [userId]);

      if (parseInt(configResult.rows[0].count, 10) === 0) {
        await Promise.all(
          Object.entries({
            ...DEFAULT_USER_CONFIG,
            destinationEmail: email,
          }).map(([key, value]) => updateUserConfigInDB(userId, key, value!))
        );
      }
    } else {
      const insertResult = await pool.query(queryCreate, [email, name]);
      userId = insertResult.rows[0].id;

      await Promise.all(
        Object.entries({
          ...DEFAULT_USER_CONFIG,
          destinationEmail: email,
        }).map(([key, value]) => updateUserConfigInDB(userId, key, value!))
      );
    }

    return userId;
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
};

export async function updateUserConfigInDB(
  userId: number,
  configKey: string,
  configValue: string
): Promise<void> {
  const query = `
    INSERT INTO user_config (user_id, config_key, config_value)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, config_key)
    DO UPDATE SET config_value = EXCLUDED.config_value
  `;
  await pool.query(query, [userId, configKey, configValue]);
}

export async function getUserConfigFromDB(userId: number): Promise<UserConfig> {
  const query = `
    SELECT config_key, config_value FROM user_config WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);

  return result.rows.reduce<UserConfig>((acc, row) => {
    acc[row.config_key] = row.config_value;
    return acc;
  }, {});
}
