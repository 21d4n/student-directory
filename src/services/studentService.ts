import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Student } from '@/types/student';

/**
 * Berlangganan realtime ke collection "mahasiswa".
 * Mengembalikan fungsi unsubscribe yang wajib dipanggil saat komponen dilepas.
 */
export function subscribeStudents(
  onData: (students: Student[]) => void,
  onError: (message: string) => void
) {
  const studentsQuery = query(collection(db, 'mahasiswa'), orderBy('nim'));

  return onSnapshot(
    studentsQuery,
    (snapshot) => {
      const students = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nim: String(data.nim ?? '-'),
          nama: String(data.nama ?? '-'),
          jurusan: String(data.jurusan ?? '-'),
          angkatan: Number(data.angkatan ?? 0),
        };
      });
      onData(students);
    },
    (error) => onError(error.message)
  );
}
