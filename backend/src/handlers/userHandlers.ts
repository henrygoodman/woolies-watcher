import { RequestHandler } from 'express';
import userRepository from '@/db/userRepository';

/**
 * Fetch the user's configuration, specifically their destination email.
 */
export const handleGetUserDestinationEmail: RequestHandler = async (
  req,
  res
) => {
  const { email } = req.user!;

  if (!email) {
    res.status(400).json({ error: 'Missing user email' });
    return;
  }

  try {
    const user = await userRepository.findByField('email', email);
    const destinationEmail = await userRepository.getDestinationEmail(
      user!.id!
    );

    res.status(200).json({ destinationEmail });
  } catch (error) {
    console.error('Error fetching destination email:', error);
    res.status(500).json({ error: 'Failed to fetch destination email' });
  }
};

/**
 * Update the user's destination email.
 */
export const handleUpdateUserDestinationEmail: RequestHandler = async (
  req,
  res
) => {
  const { email } = req.user!;
  const { destinationEmail } = req.body;

  if (!email || !destinationEmail) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const user = await userRepository.findByField('email', email);
    await userRepository.updateDestinationEmail(user!.id!, destinationEmail);

    res.status(200).json({ message: 'Destination email updated successfully' });
  } catch (error) {
    console.error('Error updating destination email:', error);
    res.status(500).json({ error: 'Failed to update destination email' });
  }
};
