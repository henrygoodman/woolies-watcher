import { RequestHandler } from 'express';
import {
  findOrCreateUser,
  getUserConfigFromDB,
  updateUserConfigInDB,
} from '@/db/userRepository';

export const handleGetUserConfig: RequestHandler = async (req, res) => {
  const { email } = req.user!;

  if (!email) {
    res.status(400).json({ error: 'Missing user email' });
  }

  try {
    const userId = await findOrCreateUser(email);

    const config = await getUserConfigFromDB(userId);
    res.status(200).json(config);
  } catch (error) {
    console.error('Error fetching user config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
};

export const handleUpdateUserConfig: RequestHandler = async (req, res) => {
  const { email } = req.user!;
  const { configKey, configValue } = req.body;

  if (!email || !configKey || configValue === undefined) {
    res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const userId = await findOrCreateUser(email);

    await updateUserConfigInDB(userId, configKey, configValue);
    res.status(200).json({ message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Error updating user config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
};
