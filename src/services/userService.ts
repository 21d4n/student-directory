import type { User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { AppRole, UserProfile } from '@/types/user';

const USERS_COLLECTION = 'users';

/** Nilai role di luar daftar yang dikenal akan dianggap 'user'. */
function normalizeRole(value: unknown): AppRole {
  return value === 'super_admin' ? 'super_admin' : 'user';
}

function toUserProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: typeof data.email === 'string' ? data.email : null,
    displayName: typeof data.displayName === 'string' ? data.displayName : null,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    role: normalizeRole(data.role),
  };
}

/**
 * Memastikan dokumen `users/{uid}` ada.
 *
 * Kalau dokumen sudah ada (mis. super admin yang di-seed manual dari Console),
 * dokumen TIDAK ditimpa — jadi role 'super_admin' tetap aman.
 * Kalau belum ada, dibuat dengan role default 'user' (sesuai Firestore rules).
 */
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const reference = doc(db, USERS_COLLECTION, user.uid);
  const snapshot = await getDoc(reference);

  if (snapshot.exists()) {
    return toUserProfile(user.uid, snapshot.data());
  }

  await setDoc(reference, {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
    role: 'user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'user',
  };
}

/**
 * Berlangganan perubahan profil (termasuk role) secara realtime.
 * Role hanya bisa diubah dari Console, jadi ini berguna saat user
 * sedang login ketika role-nya diperbarui.
 */
export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (message: string) => void
) {
  return onSnapshot(
    doc(db, USERS_COLLECTION, uid),
    (snapshot) => {
      onData(snapshot.exists() ? toUserProfile(uid, snapshot.data()) : null);
    },
    (error) => onError?.(error.message)
  );
}
