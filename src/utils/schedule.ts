// src/utils/schedule.ts
// Schedule table row generation

const TIME_SLOTS = [
  '08.00 – 09.00',
  '09.00 – 10.00',
  '10.00 – 11.00',
  '11.00 – 12.00',
  '12.00 – 13.00',
  '13.00 – 14.00',
  '14.00 – 15.00',
  '15.00 – 16.00',
  '16.00 – 17.00',
  '17.00 – 18.00',
  '18.00 – 19.00',
];

const ACTIVITIES = [
  'Pembukaan & Registrasi Peserta',
  'Ice-breaking & Orientasi Program',
  'Materi utama: Fondasi',
  'Materi utama: Implementasi',
  'Studi Kasus & Diskusi Kelompok',
  'Latihan Praktik Terbatas',
  'Kopi & Networking',
  'Materi lanjutan',
  'Workshop / Hands-on',
  'Penutupan Hari & Q&A',
];

export function buildScheduleDays(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

  const days: string[] = [];
  const cur = new Date(start);
  let dayIdx = 0;
  while (cur <= end) {
    const label = `${TIME_SLOTS[0]} — Day ${dayIdx + 1}`;
    const activity = ACTIVITIES[dayIdx % ACTIVITIES.length] || 'Sesi inti & latihan terapan';
    days.push(`${label} — ${activity}`);
    cur.setDate(cur.getDate() + 1);
    dayIdx++;
  }
  return days.length > 0 ? days : ['08.00 – 09.00 — Registrasi & Pembukaan'];
}
