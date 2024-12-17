import { findOrCreateUser } from '@/db/authRepository';
import { RequestHandler } from 'express';

export const handleAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Token missing' });
    return;
  }

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
    );
    if (!response.ok) {
      throw new Error(
        `Token verification failed: ${response.status} ${response.statusText}`
      );
    }

    const payload = await response.json();

    if (!payload.email) {
      res.status(403).json({ error: 'Forbidden: Invalid token payload' });
      return;
    }

    const { email, name } = payload;

    const userId = await findOrCreateUser(email, name);

    req.user = { id: userId, email, name };

    next();
  } catch (err) {
    console.error('Token Verification Error:', err);
    res.status(403).json({ error: 'Forbidden: Invalid token or user' });
  }
};
