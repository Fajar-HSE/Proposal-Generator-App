# Proposal Generator

Aplikasi web sederhana untuk membuat proposal pelatihan profesional dengan bantuan AI. Aplikasi ini sepenuhnya client-side (HTML + CSS + vanilla JS) — tidak butuh server.

## 🚀 Cara Mengakses

**Live (GitHub Pages)**: Buka **[https://fajar-hse.github.io/Proposal-Generator-App/](https://fajar-hse.github.io/Proposal-Generator-App/)**

Atau lokal:

```bash
cd proposal-generator
python3 -m http.server 8080
# buka http://localhost:8080
```

Tambahkan `?demo=1&sample=1` ke URL untuk auto-fill data contoh dan langsung preview.

> ⚠️ **Catatan Firebase**: Tambahkan domain GitHub Pages (`fajar-hse.github.io`) ke Firebase Console → **Authentication → Settings → Authorized domains** agar login Google tidak error.

## 📄 Hasil Akhir (Siap Jual)

Generate Proposal kini menghasilkan dokumen **multi-halaman** yang siap dikirim ke klien:

| Halaman | Isi |
|---------|-----|
| **Cover** | Judul besar, penyelenggara, perusahaan, tanggal, tahun, unit kompetensi (BNSP) |
| **Table of Contents** | Daftar isi bernomor dengan dot leaders + nomor halaman |
| **Info Proposal** | Card grid: Untuk, Penyelenggara, Tanggal, Venue, Unit Kompetensi |
| **Sections (9)** | Latar Belakang → Penutup, masing-masing dengan **nomor besar berwarna gradient** |
| **Jadwal Pelaksanaan** | Tabel terstruktur per hari |
| **Investasi** | Tabel harga dengan zebra rows |
| **Fasilitas** | Card grid dengan icon emoji |
| **Penutup** | Body + CTA box berwarna |
| **Footer** | Otomatis di tiap halaman: judul + nomor halaman |

## 🎨 3 Template Design

- **Classic** — Navy `#1E3A5F` + serif heading, kesan korporat
- **Modern** — Gradient ungu + accent warna, visual bold
- **Minimal** — Abu-abu soft + spacing longgar + dashed border

## 📥 Export

| Format | Library | Catatan |
|--------|---------|---------|
| **PDF** | Browser print native | Print → Save as PDF; full color & styling |
| **DOCX** | [docx.js 8.5](https://docx.js.org/) | Heading + tables + bullets; editable di MS Word |

## 🔐 Login (Firebase Auth)

Aplikasi memakai **Firebase Authentication** untuk login production-grade — password disimpan terenkripsi di server Google, bukan di browser.

**2 metode login yang didukung:**

1. **Email + Password** — daftar akun baru atau masuk dengan akun existing. Password di-hash & salt di server Firebase (bcrypt-style).
2. **Login dengan Google** — popup OAuth Google. Email otomatis terverifikasi oleh Google.

**Konfigurasi (sudah built-in):** lihat `app.js` bagian atas — `firebaseConfig` sudah berisi kredensial project Firebase Anda. Untuk project Firebase lain, ganti 6 nilai tersebut.

### Setup Firebase Anda Sendiri

1. Buka [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Tambahkan **Web app** (`</>`) → copy `firebaseConfig`
3. Sidebar → **Authentication** → **Sign-in method**, enable:
   - **Email/Password** ✓
   - **Google** ✓ (isi support email)
4. (Opsional) Tab **Settings → Authorized domains**, tambahkan domain deploy Anda

### URL Parameter

- `?demo=1` → auto-login user demo (Ahmad Fauzi) — berguna untuk preview
- `?demo=1&sample=1` → demo + sample data + auto-generate preview
- Tanpa parameter → muncul auth screen, wajib login via Email/Google

1. **Pilih Model Design** — Classic / Modern / Minimal
2. **Info Penting** — Nama Perusahaan, Penyelenggara, Judul, Unit Kompetensi (opsional), CTA
3. **Latar Belakang** — ✨ Suggest by AI atau input manual
4. **Deskripsi** — ✨ Suggest by AI atau input manual
5. **Tujuan** — ✨ Suggest by AI atau input manual
6. **Peserta** — ✨ Suggest by AI atau input manual
7. **Persyaratan** — ✨ Suggest by AI atau input manual
8. **Tanggal & Venue** — Input manual
9. **Biaya** — Input manual
10. **Fasilitas** — Pilih dari checkbox
11. **Penutup** — ✨ Suggest by AI atau input manual
12. **Pengaturan AI** — Atur provider, model, API key, base URL, lalu generate proposal + export PDF

## ⚙️ Pengaturan AI

Provider didukung (semua memakai format API OpenAI-compatible `/chat/completions`):

| Provider    | Base URL default                  | Catatan                              |
|-------------|-----------------------------------|--------------------------------------|
| OpenAI      | `https://api.openai.com/v1`       | Model: `gpt-4o-mini`, dll            |
| OpenRouter  | `https://openrouter.ai/api/v1`    | Model: `anthropic/claude-3.5-sonnet` |
| Groq        | `https://api.groq.com/openai/v1`  | Model: `llama-3.1-70b-versatile`     |
| Anthropic   | `https://api.anthropic.com/v1`    | Butuh penyesuaian header             |
| Custom      | (isi Base URL sendiri)            | Untuk endpoint OpenAI-compatible     |

> Setelah disimpan, aplikasi langsung bisa memanggil API untuk generate konten.

## 🖨 Export PDF

Klik tombol "Export ke PDF" setelah generate — akan membuka tab baru dengan jendela print browser. Pilih "Save as PDF".

## 🧱 Struktur File

```
proposal-generator/
├── index.html   # Markup + Firebase SDK script + form sections
├── styles.css   # Styling bersih & modern + tombol Google brand
├── app.js       # Logic: Firebase Auth, state, AI, generate, export
└── README.md
```

## 🛠 Arsitektur (untuk tim)

- **Auth**: Firebase Auth v10.7.2 (compat). `onAuthStateChanged` sebagai single source of truth — auto-login kalau session masih ada.
- **Storage**: localStorage untuk `pg_proposal` (data proposal) & `pg_ai` (API key). User data ada di memory + photo/profile dari `firebase.User`.

## 🛠 Arsitektur (untuk tim)

- **Storage**: localStorage (`pg_user`, `pg_proposal`, `pg_ai`)
- **State**: Disimpan otomatis setiap input berubah
- **AI Client**: function `callAi(cfg, messages)` — tinggal dipanggil
- **Prompt builder**: `buildPromptFor(cfg)` — bisa ditambah/diubah

## 🔒 Catatan Keamanan

- **API key LLM** (OpenAI, OpenRouter, dll) disimpan di `localStorage` browser — **bukan di server Firebase**. Hanya perangkat user yang punya akses.
- **Password user** disimpan aman di server Firebase (bcrypt + scrypt, by Google).
- **Alternatif tanpa API key tersimpan lokal**: deploy backend proxy (Cloud Functions, Workers, dsb) yang menyimpan API key di environment variable.
- **Email wajib**: sesuai kebijakan, login ditolak kalau Firebase user tidak punya email.

Dibuat oleh Senior Developer untuk tim. Happy hacking! 🚀
