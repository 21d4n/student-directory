import { Text, View } from 'react-native';

import type { Student } from '@/types/student';

export function StudentCard({ student }: { student: Student }) {
  const initial = student.nama.trim().charAt(0).toUpperCase() || '?';

  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4">
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <Text className="text-lg font-bold text-brand-600">{initial}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
          {student.nama}
        </Text>
        <Text className="mt-0.5 text-sm text-slate-500">NIM {student.nim}</Text>
        <Text className="mt-1 text-xs text-slate-400">{student.jurusan}</Text>
      </View>

      <View className="ml-2 rounded-full bg-slate-100 px-3 py-1">
        <Text className="text-xs font-semibold text-slate-600">{student.angkatan}</Text>
      </View>
    </View>
  );
}
