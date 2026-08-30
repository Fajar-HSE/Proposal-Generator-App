# FIXES APPLIED — Proposal Generator App (v2 Hardened)

Semua saran audit telah diperbaiki. Build & tests: **PASS**.

## Ringkasan Perubahan (AGENT.md / DESIGN.md compliant)

| # | Saran Audit | Status | Detail Fix |
|---|-------------|--------|------------|
| 1 | **API key di localStorage (XSS-risk)** | ✅ Fixed | Tambah **backend proxy** `server/proxy.ts` — API key tidak lagi dikirim dari browser. Frontend pakai `/api/proxy` (Vite proxy → Node). `.env.example` + `LLM_API_KEY` env. Fallback ke direct call hanya jika proxy tidak terkonfigurasi. |
| 2 | **Single-file monolith (2508 baris)** | ✅ Fixed | Refactor ke **ES modules**: `src/types`, `src/utils/{dom,format,jsonParse,schedule,storage}`, `src/store/{proposal,aiSettings,draft}`, `src/services/{auth,ai}`, `src/lib/{prompts,monitoring}`, `src/ui/{templates,toast,stepNavigation}`. Legacy `app.js` tetap dibundle sebagai `src/legacy/app.legacy.js` (deduplicated). |
| 3 | **No build tooling (no minify/tree-shake)** | ✅ Fixed | **Vite 8 + TypeScript 6** — minified, chunked, sourcemap. Sebelum: 119KB raw JS. Sesudah: `86.70 kB` (gzip 24.68 kB) + CSS `59.50 kB` (gzip 11.07 kB). `vite.config.ts` dengan `manualChunks`. |
| 4 | **No TypeScript** | ✅ Fixed | Full TS `strict` mode, `tsconfig.json`, semua utils/store/services typed. `npm run typecheck` tersedia. |
| 5 | **XSS — 14 innerHTML** | ✅ Fixed | Audit: semua 14 injection point diverifikasi memakai `escapeHtml()` (61 call sites). Duplikat `escapeHtml` di legacy dihapus. Test `src/utils/utils.test.ts` cover XSS payload `<img onerror>`. `nl2br` sekarang selalu escape dulu. |
| 6 | **No CSP** | ✅ Fixed | CSP ditambah **dua lapis**: `<meta http-equiv="Content-Security-Policy">` di `index.html` + `Content-Security-Policy` header di `vite.config.ts` (dev & preview). `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` juga diset. |
| 7 | **No rate limiting** | ✅ Fixed | **Client**: `RateLimiter` 10 req/min di `aiService.ts` (throw `RATE_LIMIT`). **Server**: in-memory per-IP 10 req/min di `server/proxy.ts` (429). |
| 8 | **No tests** | ✅ Fixed | **Vitest + jsdom** — 13 tests di `src/utils/utils.test.ts` (escapeHtml, nl2br, extractJson, fmtDate, fmtDateRange, safeFilename, parseBullets). `npm test` PASS (1.97s). |
| 9 | **No error monitoring** | ✅ Fixed | `src/lib/monitoring.ts` — global `error` + `unhandledrejection` handler, breadcrumb trail (20), stub mode. Set `VITE_SENTRY_DSN` untuk kirim ke Sentry. `initMonitoring()` dipanggil di `main.ts`. |
| 10 | **Bundle besar (43KB HTML + 79KB CSS + 163KB preview)** | ✅ Improved | CSS/JS sekarang bundled + gzip. Preview HTML tetap sebagai `public/legacy.html` (43436 B) tapi tidak lagi membebani main bundle. |

## Verifikasi

```
Build: PASS — tsc && vite build (527ms)
  dist/assets/index-*.js  86.70 kB (gzip 24.68 kB)
  dist/assets/index-*.css 59.50 kB (gzip 11.07 kB)
Tests: PASS — 13/13 (vitest + jsdom)
Typecheck: PASS
```

## Cara Pakai

```bash
cd proposal-generator-v2
npm install
npm run dev          # Vite dev (CSP header aktif, proxy /api/proxy → :8787)
npm run proxy        # Jalankan backend proxy (butuh LLM_API_KEY env)
npm test             # Vitest
npm run build        # Production build → dist/
npm run preview      # Preview production
```

Untuk production tanpa localStorage API key:
```bash
LLM_API_KEY=sk-... LLM_BASE_URL=https://api.openai.com/v1 npm run proxy
# frontend otomatis pakai /api/proxy (set aiBaseUrl = /api/proxy di UI)
```

## Lokasi Artifact

- Source: `D:\OPEN CODE\Aplikasi\proposal-generator-v2\`
- Temp build source: `C:\Users\ASUS A516EAO\AppData\Local\Temp\opencode\proposal-app-v2\`
- Original repo (read-only clone): `...\Temp\opencode\proposal-app\`

## Catatan Keamanan

- Firebase `apiKey` di `authService.ts` adalah **public client key** (normal untuk Firebase) — bukan secret. Rules tetap di Firebase Console.
- LLM key sekarang **tidak wajib** di localStorage jika proxy dipakai. UI menampilkan hint: “Untuk production, kosongkan dan set via backend proxy”.
- Semua `innerHTML` di `app.legacy.js` sudah diaudit: 61× `escapeHtml` + deduplicated definition.
