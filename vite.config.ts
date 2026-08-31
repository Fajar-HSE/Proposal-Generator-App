import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  // Fix #1: Gunakan mode Vite (bukan process.env.NODE_ENV) agar GH Pages subpath selalu benar.
  // mode==='production' saat `vite build` (termasuk di GitHub Actions) -> base /Proposal-Generator-App/
  // mode==='development' saat `vite dev` -> base / agar localhost ok
  base: mode === 'production' ? '/Proposal-Generator-App/' : '/',
  server: {
    headers: {
      // CSP applied also via meta; header is stronger when served via Vite preview/proxy
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://cdn.jsdelivr.net https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https://proposal-generator-c6bc8.firebaseapp.com https://proposal-generator-c6bc8.firebasestorage.app https://*.googleapis.com https://*.openai.com https://*.openrouter.ai https://*.groq.com https://*.anthropic.com https://api.b.ai https://*.b.ai http://localhost:* https://localhost:*; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
    proxy: {
      // Backend proxy for LLM calls — keeps API key server-side
      '/api/proxy': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://*.firebaseapp.com https://*.openai.com https://*.openrouter.ai https://api.b.ai https://*.b.ai; object-src 'none'",
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
}));
