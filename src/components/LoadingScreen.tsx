import { ActivityIndicator, Text, View } from 'react-native';

export function LoadingScreen({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-[#f6f7fb]">
      <ActivityIndicator size="large" color="#3b63e6" />
      <Text className="mt-4 text-sm text-slate-500">{message}</Text>
    </View>
  );
}
