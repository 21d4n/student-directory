import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';

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

export async function signOutFromApp() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Abaikan: sesi Firebase tetap diakhiri di bawah.
  }
  await signOut(auth);
}
