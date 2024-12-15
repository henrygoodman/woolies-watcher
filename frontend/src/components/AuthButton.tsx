'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export const AuthButton: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (session?.user) {
    const displayName = session.user.name || session.user.email || 'User';
    return (
      <div className="flex items-center gap-4">
        <p className="text-foreground">Signed in as {displayName}</p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/80"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/80"
    >
      Sign In
    </button>
  );
};
