'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full bg-background text-foreground p-4 mt-8">
      <div className="mx-auto flex flex-col items-center space-y-2">
        <p className="text-sm">&copy; {currentYear ?? '...'} Henry Goodman</p>
        <div className="flex space-x-4">
          <Link href="/faq" className="text-sm hover:underline">
            FAQ
          </Link>
          <Link href="/terms" className="text-sm hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm hover:underline">
            Privacy
          </Link>
          <Link href="/contact" className="text-sm hover:underline">
            Contact
          </Link>
        </div>
        <p className="text-xs text-center mt-4">
          Woolies Watcher is an independent project and is not affiliated with,
          endorsed, or sponsored by Woolworths or any of its subsidiaries.
        </p>
      </div>
    </footer>
  );
};
