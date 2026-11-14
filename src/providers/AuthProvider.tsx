import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth } from '@/lib/firebase';
import { ensureUserProfile } from '@/services/userService';
import type { AppRole, UserProfile } from '@/types/user';

type AuthContextValue = {
  /** null = belum login. */
  user: User | null;
  /** Profil Firestore `users/{uid}`; null = belum termuat / gagal dimuat. */
  profile: UserProfile | null;
  /** Role aplikasi; null kalau profil belum tersedia. */
  role: AppRole | null;
  initializing: boolean;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Firebase membaca sesi dari AsyncStorage lebih dulu, lalu memanggil listener ini.
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (cancelled) return;

      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setInitializing(false);
        return;
      }

      try {
        // Pastikan profil + role tersedia sebelum layar dirender, supaya
        // badge role dan aturan akses tidak berkedip / salah redirect.
        const nextProfile = await ensureUserProfile(nextUser);
        if (!cancelled) setProfile(nextProfile);
      } catch {
        // Gagal memuat profil (mis. rules belum dipublish) tidak boleh
        // memblokir login. Role dianggap tidak ada sampai berhasil dimuat.
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, role: profile?.role ?? null, initializing }),
    [user, profile, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
