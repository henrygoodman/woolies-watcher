import { jwtDecode } from 'jwt-decode';

const VALIDATE_TOKEN_API = '/api/auth/validate';

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.warn('Token is expired.');
      return false;
    }

    const response = await fetch(VALIDATE_TOKEN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error('Token validation failed:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to validate token:', error);
    return false;
  }
};

const REFRESH_TOKEN_API = '/api/auth/refresh';

export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(REFRESH_TOKEN_API, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to refresh token:', response.statusText);
      return null;
    }

    const data = await response.json();
    const { accessToken } = data;

    return accessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
};
