import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
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

import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';
import { describeAuthError, hasPasswordProvider, savePasswordForCurrentUser } from '@/services/authService';

const PROVIDER_LABELS: Record<string, string> = {
  'google.com': 'Google',
  password: 'Email & Password',
};

export default function AccountScreen() {
  const { user, role, initializing } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (initializing) {
    return <LoadingScreen message="Memuat akun..." />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const passwordLinked = hasPasswordProvider(user);
  const displayName = user.displayName ?? 'Pengguna';
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  const handleSavePassword = async () => {
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmation) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setSaving(true);

    try {
      await savePasswordForCurrentUser(password);
      setPassword('');
      setConfirmation('');
      setInfo(
        passwordLinked
          ? 'Password berhasil diganti.'
          : 'Password berhasil dipasang. Sekarang kamu bisa masuk dengan Google maupun email + password ke akun yang sama.'
      );
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center px-5 pb-4 pt-2">
        <Pressable
          className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
          onPress={() => router.back()}>
          <Text className="text-base font-semibold text-slate-700">‹</Text>
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-slate-900">Akun</Text>
        {role === 'super_admin' && (
          <View className="rounded-full bg-brand-50 px-3 py-1">
            <Text className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">
              Super Admin
            </Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        <View className="mb-5 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4">
          {user.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }}
              contentFit="cover"
            />
          ) : (
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-brand-600">
              <Text className="text-lg font-bold text-white">{initial}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-xs text-slate-500" numberOfLines={1}>
              {user.email ?? 'Tanpa email'}
            </Text>
            <Text className="mt-1 text-[10px] text-slate-400" numberOfLines={1}>
              UID {user.uid}
            </Text>
          </View>
        </View>

        <Text className="mb-2 text-sm font-semibold text-slate-700">Metode masuk</Text>
        <View className="mb-6 rounded-2xl border border-slate-100 bg-white p-4">
          {user.providerData.length === 0 ? (
            <Text className="text-xs text-slate-400">Belum ada provider ter-link.</Text>
          ) : (
            user.providerData.map((provider) => (
              <View
                key={provider.providerId}
                className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm text-slate-700">
                  {PROVIDER_LABELS[provider.providerId] ?? provider.providerId}
                </Text>
                <View className="rounded-full bg-emerald-50 px-2 py-0.5">
                  <Text className="text-[10px] font-semibold text-emerald-600">Terhubung</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text className="mb-2 text-sm font-semibold text-slate-700">
          {passwordLinked ? 'Ganti password' : 'Atur password'}
        </Text>
        <View className="rounded-2xl border border-slate-100 bg-white p-4">
          <Text className="mb-4 text-xs leading-5 text-slate-500">
            {passwordLinked
              ? 'Masukkan password baru untuk akun ini.'
              : 'Pasang password supaya kamu bisa masuk dengan email + password ke akun yang sama, tanpa kehilangan role.'}
          </Text>

          <TextInput
            className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            value={password}
            onChangeText={setPassword}
            placeholder="Password baru (minimal 6 karakter)"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!saving}
          />
          <TextInput
            className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder="Ulangi password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!saving}
            onSubmitEditing={handleSavePassword}
          />

          {error && (
            <View className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}

          {info && (
            <View className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <Text className="text-xs text-emerald-700">{info}</Text>
            </View>
          )}

          <Pressable
            className={`flex-row items-center justify-center rounded-xl px-4 py-3 ${
              saving ? 'bg-slate-300' : 'bg-brand-600'
            }`}
            disabled={saving}
            onPress={handleSavePassword}>
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-sm font-semibold text-white">
                {passwordLinked ? 'Simpan Password Baru' : 'Pasang Password'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
