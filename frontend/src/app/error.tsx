'use client';

import Link from 'next/link';

export default function ServerErrorPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-5xl font-bold text-primary mb-4">500</h1>
      <p className="text-muted-foreground mb-4">
        Oops! Something went wrong on our end.
      </p>
      <Link href="/" className="text-primary underline hover:text-primary/80">
        Go Back Home
      </Link>
    </div>
  );
}
