'use client';

import React from 'react';

interface MainAreaProps {
  title: string;
  isLoading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export const MainArea: React.FC<MainAreaProps> = ({
  title,
  isLoading,
  error,
  children,
}) => {
  return (
    <div className="flex flex-col items-center p-8 bg-background text-foreground min-h-screen">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-8 text-primary">{title}</h1>

      {/* Error and Loading Indicators */}
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive-foreground">Error: {error}</p>}

      {/* Centered Content */}
      {!isLoading && !error && (
        <div className="flex flex-col items-center w-full max-w-5xl space-y-8">
          {children}
        </div>
      )}
    </div>
  );
};
