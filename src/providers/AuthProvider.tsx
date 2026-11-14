import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth } from '@/lib/firebase';

type AuthContextValue = {
  /** null = belum login. */
  user: User | null;
  initializing: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Firebase membaca sesi dari AsyncStorage lebih dulu, lalu memanggil listener ini.
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, initializing }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
