import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** Dipakai untuk menampilkan pesan ramah jika .env belum diisi. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// getReactNativePersistence ada di entry React Native dari firebase/auth,
// tetapi tidak ikut ter-export pada tipe publiknya, jadi diakses lewat cast.
const getReactNativePersistence = (
  firebaseAuth as unknown as {
    getReactNativePersistence: (storage: unknown) => firebaseAuth.Persistence;
  }
).getReactNativePersistence;

/**
 * initializeAuth + AsyncStorage membuat sesi login dipertahankan oleh Firebase,
 * jadi auth.currentUser / onAuthStateChanged menjadi sumber kebenaran status login.
 */
export const auth = firebaseAuth.initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(firebaseApp);
