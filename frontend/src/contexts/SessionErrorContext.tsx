import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

type SessionErrorContextType = {
  error: string | null;
  setError: (error: string | null) => void;
};

const SessionErrorContext = createContext<SessionErrorContextType>({
  error: null,
  setError: () => {},
});

export const SessionErrorProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.error) {
      setError(session.error);
    }
  }, [session]);

  return (
    <SessionErrorContext.Provider value={{ error, setError }}>
      {children}
    </SessionErrorContext.Provider>
  );
};

export const useSessionError = () => useContext(SessionErrorContext);
