// src/utils/format.ts
// Formatting & date utilities

const MONTH_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function fmtDate(d: string): string {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return `${dt.getDate()} ${MONTH_ID[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function fmtDateRange(a: string, b: string): string {
  const fa = fmtDate(a);
  const fb = fmtDate(b);
  if (!fa && !fb) return '';
  if (!b || fa === fb) return fa;

  const da = new Date(a);
  const db = new Date(b);
  if (!isNaN(da.getTime()) && !isNaN(db.getTime())) {
    if (da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear()) {
      return `${da.getDate()}-${db.getDate()} ${MONTH_ID[da.getMonth()]} ${da.getFullYear()}`;
    }
  }
  return `${fa} – ${fb}`;
}

export function fmtYear(): string {
  return String(new Date().getFullYear());
}

export function formatTimeAgo(iso: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function parseBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^[\u2022\-\*]\s*/, '').trim())
    .filter(Boolean);
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function safeFilename(text: string): string {
  return (text || 'proposal')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}
