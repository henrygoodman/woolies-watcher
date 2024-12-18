'use client';

import { useSessionError } from '@/contexts/SessionErrorContext';
import { signIn } from 'next-auth/react';

export const GlobalAlert = () => {
  const { error, setError } = useSessionError();

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow-md">
      <p>{error}</p>
      <button
        onClick={() => {
          setError(null);
          signIn();
        }}
        className="mt-2 underline"
      >
        Reauthenticate
      </button>
    </div>
  );
};
