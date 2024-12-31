import { RequestHandler } from 'express';
import userRepository from '@/db/userRepository';
import { PartialDBUserSchema } from '@shared-types/db';

export const handleGetUser: RequestHandler = async (req, res) => {
  const { email } = req.user!;

  if (!email) {
    res.status(400).json({ error: 'Missing user email' });
    return;
  }

  try {
    const user = await userRepository.findByField('email', email);

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const handleUpdateUser: RequestHandler = async (req, res) => {
  const { email } = req.user!;
  const updatedUser = req.body;

  if (!email || !updatedUser) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const validationResult = PartialDBUserSchema.safeParse(updatedUser);
  if (!validationResult.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: validationResult.error.format(),
    });
    return;
  }

  try {
    const user = await userRepository.findByField('email', email);
    await userRepository.update(user?.id!, { ...updatedUser, email });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
