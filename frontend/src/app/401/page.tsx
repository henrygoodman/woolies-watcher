'use client';

import { signIn } from 'next-auth/react';

export default function UnauthorizedPage() {
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-bold text-primary mb-4">401</h1>
      <p className="text-muted-foreground mb-4">
        You are not authorized to access this page.
      </p>
      <button
        onClick={handleSignIn}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
      >
        Sign In
      </button>
    </div>
  );
}
