# Proposal Generator

Aplikasi web sederhana untuk membuat proposal pelatihan profesional dengan bantuan AI. Aplikasi ini sepenuhnya client-side (HTML + CSS + vanilla JS) — tidak butuh server.

> **Catatan UI**: aplikasi menggunakan **horizontal stepper** di atas (bukan sidebar) dengan 13 langkah bernomor. Step aktif = filled primary, step yang sudah dilewati = checkmark hijau, step yang akan datang = outline. Klik chip untuk melompat ke step itu.

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
| **Ringkasan Eksekutif** *(NEW)* | Headline tajam + Masalah vs Solusi + 3 pembeda + Hasil terukur + Investasi + Next step |
| **Table of Contents** | Daftar isi bernomor dengan dot leaders + Why Us + ROI |
| **Info Proposal** | Card grid: Untuk, Penyelenggara, Tanggal, Venue, Unit Kompetensi |
| **Sections (12)** | Latar Belakang → Penutup, masing-masing dengan **nomor besar berwarna gradient** |
| **Mengapa Memilih Kami** *(NEW)* | 5 kartu pembeda dengan ikon |
| **Dampak & ROI** *(NEW)* | 5 hasil terukur + bukti sosial, format payback 3-6 bulan |
| **Materi Pelatihan** *(NEW)* | Tabel kurikulum: no, topik + deskripsi, durasi, metode. Bisa generate via AI atau isi manual per-baris. |
| **Jadwal Pelaksanaan** | Tabel terstruktur per hari, **jumlah baris otomatis mengikuti rentang tanggal** |
| **Investasi** | Tabel harga dengan zebra rows |
| **Fasilitas** | Card grid dengan icon emoji |
| **Penutup** | Body + assumptive-close CTA block: deadline pill, masa berlaku pill, 2 kontak, tanda tangan |
| **Footer** | Otomatis di tiap halaman: judul + nomor halaman |

## 🧠 AI Strategist Pipeline

Generate konten sekarang memakai **2 tahap (chain-of-thought)** agar proposal tidak lagi terdengar generik:

1. **Tahap 1 – Riset Internal** (temperature 0.4): LLM melihat konteks klien (industri, ukuran, pain points, goals, budget, timeline, decision-makers) lalu menghasilkan JSON riset: `headline`, `hooks`, `differentiators`, `outcomes`, `proofPoints`, `objections`, `ctaProposal`, `personas`. Riset tersimpan dan tampil di **💡 panel Riset AI** di bawah tiap textarea — Anda bisa koreksi fakta sebelum menulis.
2. **Tahap 2 – Penulisan** (temperature 0.7): LLM menulis bagian final memakai insights sebagai ground truth + framework persuasi spesifik per bagian (IIIP untuk Latar Belakang, FAB untuk Deskripsi/Tujuan, Persona untuk Peserta, Checklist untuk Persyaratan, Assumptive Close untuk Penutup) + daftar **frasa terlarang** (10 klise yang dibanned habis).

Tombol tersedia di tiap step AI:
- **Generate dengan AI** – riset + tulis
- **🔄 Ulangi** – tulis ulang pakai riset terakhir
- **🔁 Riset ulang** – riset dari awal

## 📋 Brief Klien (Step baru)

Step opsional sebelum Generate dengan AI. Isi industri klien, ukuran, pain points, target bisnis, range budget, timeline keputusan, dan pengambil keputusan → LLM menghasilkan copy yang spesifik industri Anda. Kosongkan jika tidak tahu — AI otomatis menulis placeholder yang bisa diedit.

## 🎨 7 Template Design

- **Classic** — Navy `#1E3A5F` + serif heading, kesan korporat
- **Modern** — Gradient ungu + accent warna, visual bold
- **Minimal** — Abu-abu soft + spacing longgar + dashed border
- **Executive** *(NEW)* — Navy + gold serif, untuk C-level / board
- **Bold** *(NEW)* — Orange-hitam geometric, untuk pitch growth / agresif
- **Elegant** *(NEW)* — Burgundy + cream serif italic, refined / boutique
- **Corporate** *(NEW)* — Slate-biru konservatif, enterprise

Setiap template punya treatment berbeda untuk: cover, Exec Summary, Why-Us grid, ROI grid, Materi table, closing CTA, TOC, schedule.

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

1. **Pilih Model Design** — 7 pilihan template (Classic / Modern / Minimal / Executive / Bold / Elegant / Corporate)
2. **Info Penting** — Nama Perusahaan, Penyelenggara, Judul, Unit Kompetensi (opsional), CTA
3. **Brief Klien** *(NEW)* — Industri, ukuran, pain points, target bisnis, budget range, timeline keputusan, decision-makers (opsional; semakin lengkap semakin tajam output AI)
4. **Latar Belakang** — ✨ Generate / 🔄 Ulangi / 🔁 Riset ulang + panel Riset AI
5. **Deskripsi** — ✨ Generate / 🔄 Ulangi / 🔁 Riset ulang
6. **Tujuan** — ✨ Generate / 🔄 Ulangi / 🔁 Riset ulang
7. **Peserta** — ✨ Generate / 🔄 Ulangi / 🔁 Riset ulang
8. **Materi Pelatihan** *(NEW)* — Dynamic list (Sesi # → Topik → Durasi → Metode → Deskripsi). Tombol "Suggest by AI" generate 6-8 baris otomatis; tombol "+ Tambah Baris" manual.
9. **Persyaratan** — ✨ Generate / 🔄 Ulangi / 🔁 Riset ulang
10. **Tanggal & Venue** — Input manual
11. **Biaya** — Input manual
12. **Fasilitas** — Pilih dari checkbox
13. **Penutup** — ✨ Generate / 🔄 Ulangi / 🔁 Riset ulang (menghasilkan CTA assumptive + deadline + kontak + sign-off)
14. **Pengaturan AI** — Atur provider, model, API key, base URL, lalu generate proposal + export PDF/DOCX

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
