import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { signInWithGoogle } from '@/services/authService';
import googleLogo from '@/assets/images/google-logo.png';

export default function LoginScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Redirect href="/home" />;
  }

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      // Setelah berhasil, onAuthStateChanged di AuthProvider akan
      // mengubah state user dan layar ini otomatis redirect ke Home.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-8 py-12">
          <View className="mb-10 items-center">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-brand-600">
              <Text className="text-4xl">🎓</Text>
            </View>
            <Text className="text-3xl font-bold text-slate-900">Student Directory</Text>
            <Text className="mt-2 text-center text-sm text-slate-500">
              Masuk dengan akun Google untuk melihat daftar mahasiswa.
            </Text>
          </View>

          {!isFirebaseConfigured && (
            <View className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Text className="text-xs text-amber-700">
                Konfigurasi Firebase belum lengkap. Isi file .env lalu jalankan ulang aplikasi.
              </Text>
            </View>
          )}

          {error && (
            <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}

          <Pressable
            className={`flex-row items-center justify-center rounded-2xl px-6 py-4 ${
              loading ? 'bg-slate-300' : 'bg-brand-600'
            }`}
            disabled={loading}
            onPress={handleSignIn}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-white">
                  <Image
                    source={googleLogo}
                    style={{ width: 18, height: 18 }}
                    contentFit="contain"
                  />
                </View>
                <Text className="text-base font-semibold text-white">Sign in with Google</Text>
              </>
            )}
          </Pressable>

          <Text className="mt-6 text-center text-xs text-slate-400">
            Sesi login disimpan oleh Firebase Authentication.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
