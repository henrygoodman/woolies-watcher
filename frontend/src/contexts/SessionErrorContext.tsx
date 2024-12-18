'use client';

import { createContext, useContext, useState } from 'react';

type SessionErrorContextType = {
  error: string | null;
  setError: (error: string | null) => void;
};

const SessionErrorContext = createContext<SessionErrorContextType | undefined>(
  undefined
);

export const SessionErrorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <SessionErrorContext.Provider value={{ error, setError }}>
      {children}
    </SessionErrorContext.Provider>
  );
};

export const useSessionError = (): SessionErrorContextType => {
  const context = useContext(SessionErrorContext);
  if (!context) {
    throw new Error(
      'useSessionError must be used within a SessionErrorProvider'
    );
  }
  return context;
};
