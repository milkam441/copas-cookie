# Installation Guide - Database Setup

## Prerequisites

Aplikasi sekarang menggunakan database SQLite untuk menyimpan data agar bisa diakses dari komputer lain.

## Installation Steps

1. **Install Dependencies**

   Install package database yang diperlukan:
   ```bash
   npm install better-sqlite3 @types/better-sqlite3
   ```

   Atau jika menggunakan package manager lain:
   ```bash
   yarn add better-sqlite3 @types/better-sqlite3
   # atau
   pnpm add better-sqlite3 @types/better-sqlite3
   ```

2. **Build Native Modules (jika diperlukan)**

   `better-sqlite3` menggunakan native modules. Jika terjadi error saat install, pastikan:
   - Python 2.7 atau 3.x terinstall
   - Build tools terinstall (Visual Studio Build Tools untuk Windows)
   - Node.js versi 18 atau lebih baru

   Untuk Windows dengan Laragon, biasanya sudah include build tools.

3. **Database Location**

   Database akan otomatis dibuat di folder `data/cookies.db` saat pertama kali aplikasi dijalankan.

4. **Run Application**

   ```bash
   npm run dev
   ```

   Database akan otomatis diinisialisasi saat pertama kali API dipanggil.

## Database Structure

- **entries**: Menyimpan data entry (website, username, password, createdAt)
- **cookies**: Menyimpan data cookies untuk setiap entry
- Auto-cleanup: Entri yang lebih dari 1 jam akan otomatis dihapus

## API Endpoints

- `GET /api/entries` - Mendapatkan semua entri aktif
- `POST /api/entries` - Menambah entri baru
- `GET /api/entries/[id]` - Mendapatkan entri berdasarkan ID
- `DELETE /api/entries/[id]` - Menghapus entri
- `POST /api/cleanup` - Manual cleanup expired entries

## Multi-Computer Access

Dengan database, data sekarang bisa diakses dari komputer lain dalam jaringan yang sama:
- Pastikan server Next.js berjalan dan bisa diakses dari jaringan
- Semua komputer bisa mengakses melalui IP server (contoh: http://192.168.1.100:3000)
- Data akan tersinkronisasi secara real-time (polling setiap 5 detik)

## Troubleshooting

### Error: Cannot find module 'better-sqlite3'
- Pastikan sudah install dependencies: `npm install better-sqlite3 @types/better-sqlite3`
- Rebuild native modules: `npm rebuild better-sqlite3`

### Error: Database locked
- Pastikan hanya satu instance aplikasi yang berjalan
- Restart server jika diperlukan

### Database tidak terbuat
- Pastikan folder `data/` bisa ditulis
- Check permissions folder

