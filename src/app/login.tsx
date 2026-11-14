import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  describeAuthError,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/services/authService';
import googleLogo from '@/assets/images/google-logo.png';

type Mode = 'signin' | 'signup';
type PendingAction = 'email' | 'google' | 'reset' | null;

export default function LoginScreen() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (user) {
    return <Redirect href="/home" />;
  }

  const busy = pending !== null;

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setInfo(null);
  };

  const handleEmailAuth = async () => {
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setPending('email');

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      // onAuthStateChanged di AuthProvider akan mengubah state user dan
      // layar ini otomatis redirect ke Home.
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setPending(null);
    }
  };

  const handleSignInGoogle = async () => {
    setError(null);
    setInfo(null);
    setPending('google');

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setPending(null);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError('Isi email terlebih dahulu untuk mengirim link reset password.');
      return;
    }

    setPending('reset');

    try {
      await sendPasswordReset(email);
      setInfo(`Link reset password sudah dikirim ke ${email.trim()}.`);
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setPending(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-8 py-12">
          <View className="mb-10 items-center">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-brand-600">
              <Text className="text-4xl">🎓</Text>
            </View>
            <Text className="text-3xl font-bold text-slate-900">Student Directory</Text>
            <Text className="mt-2 text-center text-sm text-slate-500">
              Masuk dengan Google atau email & password untuk melihat daftar mahasiswa.
            </Text>
          </View>

          {!isFirebaseConfigured && (
            <View className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Text className="text-xs text-amber-700">
                Konfigurasi Firebase belum lengkap. Isi file .env lalu jalankan ulang aplikasi.
              </Text>
            </View>
          )}

          <View className="mb-5 flex-row rounded-2xl bg-slate-100 p-1">
            <Pressable
              className={`flex-1 items-center rounded-xl py-2.5 ${
                mode === 'signin' ? 'bg-white' : ''
              }`}
              onPress={() => switchMode('signin')}>
              <Text
                className={`text-sm font-semibold ${
                  mode === 'signin' ? 'text-slate-900' : 'text-slate-500'
                }`}>
                Masuk
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 items-center rounded-xl py-2.5 ${
                mode === 'signup' ? 'bg-white' : ''
              }`}
              onPress={() => switchMode('signup')}>
              <Text
                className={`text-sm font-semibold ${
                  mode === 'signup' ? 'text-slate-900' : 'text-slate-500'
                }`}>
                Daftar
              </Text>
            </Pressable>
          </View>

          <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Email
          </Text>
          <TextInput
            className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            value={email}
            onChangeText={setEmail}
            placeholder="nama@email.com"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            editable={!busy}
          />

          <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Password
          </Text>
          <TextInput
            className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'signup' ? 'Minimal 6 karakter' : 'Password akun'}
            placeholderTextColor="#94a3b8"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            textContentType={mode === 'signup' ? 'newPassword' : 'password'}
            editable={!busy}
            onSubmitEditing={handleEmailAuth}
          />

          {mode === 'signin' && (
            <Pressable
              className="mb-4 self-end"
              disabled={busy}
              onPress={handleResetPassword}>
              {pending === 'reset' ? (
                <ActivityIndicator size="small" color="#3b63e6" />
              ) : (
                <Text className="text-xs font-semibold text-brand-600">Lupa password?</Text>
              )}
            </Pressable>
          )}

          {error && (
            <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}

          {info && (
            <View className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <Text className="text-xs text-emerald-700">{info}</Text>
            </View>
          )}

          <Pressable
            className={`flex-row items-center justify-center rounded-2xl px-6 py-4 ${
              busy ? 'bg-slate-300' : 'bg-brand-600'
            }`}
            disabled={busy}
            onPress={handleEmailAuth}>
            {pending === 'email' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">
                {mode === 'signin' ? 'Masuk dengan Email' : 'Daftar dengan Email'}
              </Text>
            )}
          </Pressable>

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-slate-200" />
            <Text className="mx-3 text-xs font-medium text-slate-400">atau</Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>

          <Pressable
            className={`flex-row items-center justify-center rounded-2xl border px-6 py-4 ${
              busy ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-white'
            }`}
            disabled={busy}
            onPress={handleSignInGoogle}>
            {pending === 'google' ? (
              <ActivityIndicator color="#3b63e6" />
            ) : (
              <>
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-white">
                  <Image
                    source={googleLogo}
                    style={{ width: 18, height: 18 }}
                    contentFit="contain"
                  />
                </View>
                <Text className="text-base font-semibold text-slate-700">Sign in with Google</Text>
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
