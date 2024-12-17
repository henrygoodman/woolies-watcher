'use client';

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-bold text-primary mb-4">404</h1>
      <p className="text-muted-foreground mb-4">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link href="/" className="text-primary underline hover:text-primary/80">
        Go back home
      </Link>
    </div>
  );
}
