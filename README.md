# Student Directory

Aplikasi React Native (Expo) untuk tugas Firebase: login Google dengan Firebase Authentication,
sesi login dipertahankan lewat AsyncStorage, dan daftar mahasiswa dibaca realtime dari
Cloud Firestore.

## Fitur

- Sign in with Google (native Google Sign-In di Android development build)
- Sesi login disimpan oleh Firebase Auth Persistence (`initializeAuth` + `getReactNativePersistence`)
- Buka aplikasi langsung ke Home jika sesi masih aktif (tanpa flicker halaman login)
- Home: foto, nama, email pengguna, jumlah mahasiswa, daftar mahasiswa, tombol Logout
- Data mahasiswa realtime dari Firestore (`onSnapshot`) dengan loading / empty / error state
- Authentication guard: Home tidak bisa diakses tanpa login
- Read-only: aplikasi tidak bisa menambah, mengubah, atau menghapus data

## Struktur Project

```
student-directory/
├── src/
│   ├── app/                 # routing (expo-router)
│   │   ├── _layout.tsx      # AuthProvider + Stack
│   │   ├── index.tsx        # penentu awal: Home atau Login
│   │   ├── login.tsx
│   │   └── home.tsx
│   ├── components/          # StudentCard, LoadingScreen
│   ├── hooks/               # useAuth
│   ├── lib/firebase.ts      # init Firebase + Auth (persistence) + Firestore
│   ├── providers/           # AuthProvider (onAuthStateChanged)
│   ├── services/            # authService, studentService
│   ├── types/               # tipe Student
│   └── global.css           # NativeWind
├── .env.example
├── app.json
└── package.json
```

## Prasyarat (Windows)

- Node.js 20+
- Android Studio + Android SDK + emulator (sudah jalan saat `expo run:android`)
- JDK 17/21 dan `JAVA_HOME` ter-set
- `ANDROID_HOME` ter-set (contoh: `C:\Users\<user>\AppData\Local\Android\Sdk`)

## 1. Instalasi

```bash
cd student-directory
npm install
```

## 2. Konfigurasi Firebase

### a. Buat project Firebase

1. Buka https://console.firebase.google.com → **Add project**.
2. Setelah project jadi, buka **Project settings** → tab **General** → **Your apps** →
   **Add app** → **Web** → beri nama bebas.
3. Salin nilai `firebaseConfig` ke file `.env`:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
```

> `.env` sudah masuk `.gitignore`. Jangan pernah commit file ini.

### b. Aktifkan Google Sign-In

1. **Authentication** → **Sign-in method** → **Google** → **Enable**.
2. Simpan. Firebase akan membuat OAuth client bertipe **Web** di Google Cloud Console
   (project yang sama). Client ID inilah yang dipakai di `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

### c. Buat OAuth client Android (WAJIB untuk Google Sign-In native)

Google Sign-In di Android memeriksa `package name` + `SHA-1` sertifikat aplikasi.

1. Buka https://console.cloud.google.com → pilih project Firebase tadi.
2. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
3. Application type: **Android**.
4. Name: bebas. **Package name**: `com.studentdirectory.app`
   (harus sama dengan `expo.android.package` di `app.json`).
5. **SHA-1 certificate fingerprint** — **penting**: build debug dari `expo prebuild` ditandatangani
   dengan `android/app/debug.keystore` (bukan `~/.android/debug.keystore`). Ambil SHA-1 dari
   **APK yang benar-benar terpasang**, supaya tidak salah:

```bash
# Windows (build-tools ada di folder SDK Anda)
"%LOCALAPPDATA%\Android\Sdk\build-tools\37.0.0\apksigner.bat" verify --print-certs ^
  android\app\build\outputs\apk\debug\app-debug.apk
```

Salin baris `certificate SHA-1 digest`. Untuk project ini nilainya:

```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

> Alternatif: lihat langsung keystore yang dipakai Gradle:
> `keytool -list -v -keystore android\app\debug.keystore -alias androiddebugkey -storepass android`
>
> Kalau nanti build ulang dengan `expo prebuild --clean`, keystore bisa dibuat ulang sehingga
> SHA-1 berubah. Cara aman: daftarkan **kedua** fingerprint di Firebase, atau salin
> `%USERPROFILE%\.android\debug.keystore` ke `android\app\debug.keystore` sebelum build.
6. **Create**.

Tambahkan juga akun Google kamu sebagai **Test user** di
**APIs & Services → OAuth consent screen** selama status masih *Testing*.

### d. Buat Cloud Firestore

1. **Firestore Database** → **Create database** → pilih lokasi (mis. `asia-southeast2`) →
   mode **Production** atau **Test** (untuk tugas, **Test** boleh, tapi rules di bawah tetap dipakai).
2. Buat collection `mahasiswa` dan 5 dokumen dengan field:

| Field      | Type   | Contoh               |
| ---------- | ------ | -------------------- |
| `nim`      | string | `2211001`            |
| `nama`     | string | `Andi Saputra`       |
| `jurusan`  | string | `Teknik Informatika` |
| `angkatan` | number | `2022`               |

3. Tab **Rules**, ganti menjadi:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /mahasiswa/{document} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

Artinya: hanya user yang sudah login yang boleh membaca, dan tidak ada yang boleh menulis
dari aplikasi (data hanya diisi manual dari Console).

## 3. Menjalankan Aplikasi (development build)

Pastikan emulator Android sudah menyala (`adb devices` menampilkan device), lalu:

```bash
npx expo run:android
```

Perintah ini akan membuat folder `android/`, meng-compile aplikasi, memasangnya ke emulator,
dan menjalankan Metro. Build pertama bisa memakan waktu 10–20 menit.

Setelah terpasang, untuk sesi berikutnya cukup:

```bash
npx expo start
```

lalu pilih `a` (Android).

## 4. Checklist Testing

1. Buka aplikasi pertama kali → halaman **Login** tampil.
2. Tekan **Sign in with Google** → pilih akun → kembali ke aplikasi.
3. Berhasil masuk ke **Home**, foto/nama/email tampil.
4. Jumlah mahasiswa dan daftar mahasiswa tampil dari Firestore.
5. Ubah data di Firebase Console → aplikasi langsung berubah tanpa restart (realtime).
6. Tutup aplikasi (swipe dari recent apps) lalu buka lagi → langsung masuk **Home**.
7. Tekan **Logout** → kembali ke Login.
8. Setelah logout, buka ulang aplikasi → tetap di Login.

## 5. Troubleshooting

| Masalah | Penyebab umum |
| --- | --- |
| `DEVELOPER_ERROR` / kode `10` saat login | Package name atau SHA-1 tidak cocok dengan OAuth client Android di Google Cloud Console. Cek SHA-1 dari **APK yang terpasang** (lihat bagian 2c), jangan dari `~/.android/debug.keystore` |
| `12501` / login langsung batal | Akun belum ditambahkan sebagai **Test user** di OAuth consent screen, atau emulator tanpa Google Play Services |
| `auth/operation-not-allowed` | Provider Google belum diaktifkan di Firebase Authentication |
| `Missing or insufficient permissions` | Firestore Rules belum diubah / user belum login |
| Daftar mahasiswa kosong | Nama collection bukan `mahasiswa`, atau belum ada dokumen |
| Perubahan `.env` tidak terbaca | Hentikan Metro, jalankan ulang dengan `npx expo start -c` |

## 6. Catatan Teknis

- **Sumber kebenaran sesi**: Firebase Auth. `AuthProvider` mendengarkan `onAuthStateChanged`,
  sehingga tidak ada pengecekan token manual di AsyncStorage. AsyncStorage hanya dipakai
  Firebase untuk menyimpan sesi.
- **Anti-flicker**: `src/app/index.tsx` menampilkan loading screen selama status auth masih
  `initializing`, baru setelah itu redirect ke `/home` atau `/login`.
- **Read-only**: tidak ada `addDoc`/`updateDoc`/`deleteDoc` di kode, dan rules menolak semua write.
- **Realtime**: `src/services/studentService.ts` memakai `onSnapshot` dan mengembalikan fungsi
  `unsubscribe` yang dipanggil saat layar Home dilepas.

## 7. Skrip Video Demo (≤ 1 menit)

| Detik | Adegan |
| --- | --- |
| 0–5 | Tampilkan Firebase Console: **Authentication → Users** (akun Google) dan **Firestore → mahasiswa** (5 data) |
| 5–15 | Buka app → masih di Home (sesi tersimpan). Tekan **Logout** → kembali ke Login |
| 15–25 | Tekan **Sign in with Google** → pilih akun → masuk ke Home |
| 25–40 | Sorot kartu **Total Mahasiswa** + daftar mahasiswa; tarik sedikit untuk memperlihatkan data |
| 40–50 | Di Console, tambah/ubah satu dokumen → kembali ke app → data berubah **tanpa reload** (realtime) |
| 50–60 | Force-stop app dari Recent Apps → buka lagi → langsung Home (bukti Auth Persistence) |

Kalimat penutup yang bisa diucapkan: *"Login memakai Google Sign-In + Firebase Authentication,
sesi disimpan di AsyncStorage sehingga tidak perlu login ulang, dan daftar mahasiswa dibaca
realtime dari Cloud Firestore yang bersifat read-only."*
