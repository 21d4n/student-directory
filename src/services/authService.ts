import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

// webClientId dipakai supaya Google mengembalikan ID token yang bisa
// diverifikasi Firebase Authentication.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const result = await GoogleSignin.signIn();

  if (result.type !== 'success') {
    throw new Error('Login dibatalkan.');
  }

  const idToken = result.data?.idToken;

  if (!idToken) {
    throw new Error('Google tidak mengembalikan ID token.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

/** true kalau akun sudah punya provider email/password. */
export function hasPasswordProvider(user: User | null) {
  return Boolean(user?.providerData.some((provider) => provider.providerId === 'password'));
}

/**
 * Menambahkan provider Email/Password ke akun yang sedang login (biasanya
 * akun Google). Setelah ini, email + password bisa dipakai untuk masuk ke
 * akun yang SAMA (UID sama), lengkap dengan role yang sudah dimiliki.
 *
 * Catatan: Firebase menyimpan email dari akun yang sedang login, jadi user
 * tidak perlu mengetik email lagi — dia hanya memilih password.
 */
export async function linkPasswordToCurrentUser(password: string) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Kamu harus login terlebih dahulu.');
  }

  if (!currentUser.email) {
    throw new Error('Akun ini tidak memiliki email sehingga password tidak bisa dipasang.');
  }

  const credential = EmailAuthProvider.credential(currentUser.email, password);
  return linkWithCredential(currentUser, credential);
}

export async function signOutFromApp() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Abaikan: sesi Firebase tetap diakhiri di bawah.
  }
  await signOut(auth);
}

/** Kode error Firebase Auth dipetakan ke pesan yang ramah untuk user. */
export function describeAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/missing-password':
      return 'Password wajib diisi.';
    case 'auth/weak-password':
      return 'Password minimal 6 karakter.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau password salah. Kalau akun ini dibuat lewat Google, masuk dengan Google lalu atur password di halaman Akun.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Kalau akunnya dibuat lewat Google, masuk dengan Google lalu atur password di halaman Akun.';
    case 'auth/user-disabled':
      return 'Akun ini sedang dinonaktifkan.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
    case 'auth/requires-recent-login':
      return 'Sesi kamu sudah terlalu lama. Logout lalu login ulang dengan Google, kemudian coba lagi.';
    case 'auth/provider-already-linked':
      return 'Akun ini sudah punya password. Gunakan menu Ganti Password.';
    case 'auth/credential-already-in-use':
      return 'Email dan password ini sudah dipakai oleh akun lain.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan lalu coba lagi.';
    default:
      return error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal.';
  }
}
