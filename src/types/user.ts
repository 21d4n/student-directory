/**
 * Role aplikasi (bukan role Firebase). Disimpan di dokumen Firestore
 * `users/{uid}` supaya berlaku sama untuk semua provider login
 * (Google maupun Email/Password) karena UID-nya sama.
 */
export type AppRole = 'super_admin' | 'user';

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: AppRole;
};
