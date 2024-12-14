'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export const AuthButton: React.FC = () => {
  const { data: session, status } = useSession();

  // While session is loading, you might show a placeholder
  if (status === 'loading') {
    return <p>Checking authentication...</p>;
  }

  if (session?.user) {
    // User is signed in
    return (
      <button
        onClick={() => signOut()}
        className="px-4 py-2 text-white rounded"
      >
        Sign Out
      </button>
    );
  }

  // User is not signed in
  return (
    <button
      onClick={() => signIn('google')}
      className="px-4 py-2 text-white rounded"
    >
      Sign In
    </button>
  );
};
