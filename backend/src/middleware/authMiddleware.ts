import userRepository from '@/db/userRepository';
import { RequestHandler } from 'express';

export const handleAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Token missing' });
    return;
  }

  try {
    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
    );
    if (!tokenInfoResponse.ok) {
      throw new Error(
        `Token verification failed: ${tokenInfoResponse.status} ${tokenInfoResponse.statusText}`
      );
    }

    const tokenInfo = await tokenInfoResponse.json();

    if (!tokenInfo.email) {
      res.status(403).json({ error: 'Forbidden: Invalid token payload' });
      return;
    }

    const { email } = tokenInfo;

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error(
        `Failed to fetch user info: ${userInfoResponse.status} ${userInfoResponse.statusText}`
      );
    }

    const userInfo = await userInfoResponse.json();
    const { name } = userInfo;

    const user = await userRepository.findOrCreate(email, name);

    req.user = { id: user.id!, email, name };

    next();
  } catch (err) {
    console.error('Authentication Error:', err);
    res.status(403).json({ error: 'Forbidden: Invalid token or user' });
  }
};
