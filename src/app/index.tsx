import { Redirect } from 'expo-router';

import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';

/**
 * Halaman awal: menunggu Firebase selesai memeriksa sesi tersimpan,
 * lalu mengarahkan ke Home (masih login) atau Login (belum login).
 */
export default function IndexScreen() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <LoadingScreen message="Memeriksa sesi login..." />;
  }

  return <Redirect href={user ? '/home' : '/login'} />;
}
