import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingScreen } from '@/components/LoadingScreen';
import { StudentCard } from '@/components/StudentCard';
import { useAuth } from '@/hooks/useAuth';
import { signOutFromApp } from '@/services/authService';
import { subscribeStudents } from '@/services/studentService';
import type { Student } from '@/types/student';

export default function HomeScreen() {
  const { user, role, initializing } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Listener realtime: setiap perubahan di Firestore langsung masuk ke state.
    const unsubscribe = subscribeStudents(
      (data) => {
        setStudents(data);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      },
      (message) => {
        setError(message);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, [user, refreshKey]);

  if (initializing) {
    return <LoadingScreen message="Memeriksa sesi login..." />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const displayName = user.displayName ?? 'Pengguna';
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between pb-4 pl-5 pr-5 pt-2">
        <View className="flex-1 flex-row items-center">
          {user.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              className="h-11 w-11 rounded-full bg-slate-200"
            />
          ) : (
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-600">
              <Text className="text-lg font-bold text-white">{initial}</Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
              Halo, {displayName.split(' ')[0]} 👋
            </Text>
            <Text className="text-xs text-slate-500" numberOfLines={1}>
              {user.email}
            </Text>
            {role === 'super_admin' && (
              <View className="mt-1 self-start rounded-full bg-brand-50 px-2 py-0.5">
                <Text className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                  Super Admin
                </Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          className="ml-3 rounded-xl border border-slate-200 bg-white px-4 py-2"
          onPress={() => router.push('/account')}>
          <Text className="text-sm font-semibold text-slate-700">Akun</Text>
        </Pressable>

        <Pressable
          className={`ml-2 rounded-xl border border-slate-200 bg-white px-4 py-2 ${
            loggingOut ? 'opacity-50' : ''
          }`}
          disabled={loggingOut}
          onPress={async () => {
            setLoggingOut(true);
            try {
              await signOutFromApp();
            } finally {
              setLoggingOut(false);
            }
          }}>
          {loggingOut ? (
            <ActivityIndicator size="small" color="#3b63e6" />
          ) : (
            <Text className="text-sm font-semibold text-slate-700">Logout</Text>
          )}
        </Pressable>
      </View>

      <View className="mx-5 mb-5 rounded-2xl bg-brand-600 p-5">
        <Text className="text-xs uppercase tracking-wide text-brand-100">Total Mahasiswa</Text>
        <Text className="mt-1 text-3xl font-bold text-white">{students.length}</Text>
        <Text className="mt-1 text-xs text-brand-100">
          Data langsung dari Cloud Firestore
        </Text>
      </View>

      <View className="flex-1 px-5">
        <Text className="mb-3 text-sm font-semibold text-slate-700">Daftar Mahasiswa</Text>

        {error ? (
          <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <Text className="text-sm font-semibold text-red-600">Gagal memuat data</Text>
            <Text className="mt-1 text-xs text-red-500">{error}</Text>
            <Pressable
              className="mt-3 self-start rounded-xl bg-red-600 px-4 py-2"
              onPress={() => {
                setError(null);
                setLoading(true);
                setRefreshKey((key) => key + 1);
              }}>
              <Text className="text-xs font-semibold text-white">Coba lagi</Text>
            </Pressable>
          </View>
        ) : loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b63e6" />
            <Text className="mt-3 text-sm text-slate-500">Memuat data mahasiswa...</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <StudentCard student={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  setError(null);
                  setRefreshKey((key) => key + 1);
                }}
                colors={['#3b63e6']}
              />
            }
            ListEmptyComponent={
              <View className="items-center rounded-2xl border border-dashed border-slate-200 bg-white py-12">
                <Text className="text-2xl">📭</Text>
                <Text className="mt-2 text-sm font-medium text-slate-600">
                  Belum ada data mahasiswa
                </Text>
                <Text className="mt-1 text-xs text-slate-400">
                  Tambahkan dokumen di collection mahasiswa
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
