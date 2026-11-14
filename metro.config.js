const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind membandingkan path hasil resolve Metro dengan `input` yang dihitung
// dari cwd. Kalau folder project adalah junction/symlink (mis. C:\Code\... -> C:\sd),
// Metro melaporkan real path-nya sehingga perbandingan gagal dan CSS tidak
// digenerate (semua className jadi no-op). Pakai real path di kedua sisi.
const input = fs.realpathSync(path.resolve(__dirname, 'src/global.css'));

module.exports = withNativeWind(config, { input });
