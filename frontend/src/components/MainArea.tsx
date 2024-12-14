'use client';

import React from 'react';

interface MainAreaProps {
  children: React.ReactNode;
}

export const MainArea: React.FC<MainAreaProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-b from-emerald-600 to-emerald-400 text-white min-h-screen">
      {children}
    </div>
  );
};
