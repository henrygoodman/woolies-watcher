'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export const AuthButton: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>...</p>;
  }

  if (session?.user) {
    const displayName = session.user.name || session.user.email || 'User';
    return (
      <div className="flex items-center gap-4">
        <p className="text-white">Signed in as {displayName}</p>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-white rounded"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-4 py-2 text-white rounded"
    >
      Sign In
    </button>
  );
};
