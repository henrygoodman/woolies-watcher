import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      name?: string | null;
      email: string;
      image?: string | null;
    } & DefaultSession['user'];
  }
}
