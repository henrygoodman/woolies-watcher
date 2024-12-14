'use client';

import { LoginPopup } from '@/components/LoginPopup';

export const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-lg font-bold">Woolies Watcher</h1>
      <nav className="flex items-center space-x-4">
        <a href="/" className="text-gray-300 hover:text-white">
          Home
        </a>
        <span className="text-gray-500">|</span>
        <LoginPopup />
      </nav>
    </header>
  );
};
