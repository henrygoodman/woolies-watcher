'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-background text-foreground p-4 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-2">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Woolies Watcher
        </p>
        <div className="flex space-x-4">
          <Link href="/terms" className="text-sm hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-sm hover:underline">
            Privacy Policy
          </Link>
          <Link href="/contact" className="text-sm hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};
