import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.rewrite(new URL('/401', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/watchlist', '/settings'],
};
