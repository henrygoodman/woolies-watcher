import { useSessionError } from '@/contexts/SessionErrorContext';
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

type JWT = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  error?: string;
  name?: string;
  email?: string;
  picture?: string;
};

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: token.refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Failed to refresh token:', errorDetails);
      throw new Error('Failed to refresh access token');
    }

    const refreshedTokens = await response.json();

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const typedToken = token as JWT;

      if (account && user) {
        return {
          accessToken: account.access_token!,
          refreshToken: account.refresh_token!,
          accessTokenExpires: account.expires_at! * 1000,
          name: user.name,
          email: user.email,
          picture: user.image,
        };
      }

      if (
        typedToken.accessTokenExpires &&
        Date.now() < typedToken.accessTokenExpires
      ) {
        return typedToken;
      }

      try {
        return await refreshAccessToken(typedToken);
      } catch (error) {
        const { setError } = useSessionError();
        setError('Your session has expired. Please sign in again.');
        return { ...typedToken, error: 'RefreshAccessTokenError' };
      }
    },

    async session({ session, token }) {
      const typedToken = token as JWT;
      session.accessToken = typedToken.accessToken;
      session.error = typedToken.error;
      session.user.name = typedToken.name || session.user.name;
      session.user.email = typedToken.email || session.user.email;
      session.user.image = typedToken.picture || session.user.image;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
