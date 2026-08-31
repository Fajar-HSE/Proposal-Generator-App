// src/lib/prompts.ts
import type { ProposalState } from '../types';

const FRAMEWORKS: Record<string, string> = {
  IIIP: 'Gunakan struktur Issue → Impact → Implication → Payoff, TAPI hanya pakai data user sebagai fakta. Jika data tidak ada, gunakan hedging "berpotensi/dapat membantu/diperkirakan".',
  FAB: 'Gunakan kerangka Feature → Advantage → Benefit, fokus pada output nyata peserta (materi→aktivitas→output→bukti).',
  PERSONA: 'Gunakan kerangka Persona → Pains → Gains → Channels, hanya dari profil peserta yang diinput user.',
  CHECKLIST: 'Setiap poin harus dapat diverifikasi oleh panitia.',
  ASSUMPTIVE_CLOSE: 'Gunakan assumptive close yang soft, jangan memaksa. Sebutkan next step konkret tanpa klaim berlebihan.',
};

const BANNED_PHRASES = [
  'dalam era digital',
  'tidak dapat dipungkiri',
  'semoga bermanfaat',
  'semoga proposal ini',
  'kami berharap',
  'silakan menghubungi kami',
  'tidak ada salahnya',
  'saat ini kita berada di',
  'di era yang serba digital',
  'revolusi industri 4.0',
  'akan meningkatkan sebesar',
  'terbukti meningkatkan',
  'dijamin',
  'pasti akan',
  'transformasi digital',
  'solusi terdepan',
  'best-in-class',
  'world-class',
  'cutting-edge',
];

const FACT_RULES = `ATURAN ANTI-HALUSINASI WAJIB:
1. DATA DARI USER = fakta yang boleh dinyatakan sebagai fakta.
2. INFERENCE = analisis AI WAJIB pakai bahasa hedging: "berpotensi", "dapat membantu", "dirancang untuk mendukung", "diperkirakan", "perlu diukur berdasarkan baseline".
3. RECOMMENDATION = usulan, bukan klaim kondisi aktual.
4. JANGAN mengarang kondisi klien. Jika user tidak beri data masalah, JANGAN buat masalah. Tulis kebutuhan secara netral: "Program dirancang untuk mendukung..." bukan "Perusahaan Anda bermasalah...".
5. JANGAN klaim angka spesifik (15%, 30%) tanpa baseline. Ganti dengan "Besaran dampak aktual perlu diukur berdasarkan baseline konsumsi/kondisi aset di lokasi."
6. Kurangi marketing jargon. Bahasa lugas, evidence-based.
7. Setiap klaim harus bisa dibuktikan atau diberi placeholder [ukur di lokasi].`;

export function buildInsightsPrompt(_sectionKey: string, proposalData: ProposalState): string {
  const cb = proposalData.clientBrief || ({} as ProposalState['clientBrief']);
  return `Konteks klien:
- Industri: ${cb.clientIndustry || 'umum'}
- Ukuran: ${cb.companySize || '-'}
- Pain: ${cb.topPainPoints || '-'}
- Goals: ${cb.businessGoals || '-'}
- Budget: ${cb.budgetRange || '-'}
- Timeline: ${cb.decisionTimeline || '-'}
- Decision-maker: ${cb.decisionMakers || '-'}
Proposal: ${proposalData.companyName} | ${proposalData.proposalTitle}
Hindari frasa: ${BANNED_PHRASES.join(', ')}
Output HANYA JSON valid.`;
}

export function buildSystemPrompt(sectionKey: string): string {
  const fw =
    sectionKey === 'background'
      ? FRAMEWORKS.IIIP
      : sectionKey === 'description' || sectionKey === 'objectives'
        ? FRAMEWORKS.FAB
        : sectionKey === 'audience'
          ? FRAMEWORKS.PERSONA
          : sectionKey === 'requirements'
            ? FRAMEWORKS.CHECKLIST
            : FRAMEWORKS.ASSUMPTIVE_CLOSE;
  return `Anda konsultan senior Indonesia. Tulis B2B proposal faktual, lugas, minim jargon.\n${FACT_RULES}\nFramework: ${fw}\nHindari frasa: ${BANNED_PHRASES.join(', ')}\n200-500 kata, bahasa Indonesia formal korporat.`;
}

export function buildSectionPrompt(
  sectionKey: string,
  proposalData: ProposalState,
  insightsJson: string,
): string {
  const labelMap: Record<string, string> = {
    background: 'Latar Belakang',
    description: 'Deskripsi Pelatihan',
    objectives: 'Tujuan',
    audience: 'Peserta',
    requirements: 'Persyaratan Peserta',
    closing: 'Penutup',
  };
  const label = labelMap[sectionKey] || sectionKey;
  return `Tulis bagian "${label}" untuk ${proposalData.companyName} — ${proposalData.proposalTitle}
CTA: ${proposalData.cta}
${insightsJson ? `Ground truth: ${insightsJson}` : ''}
Hindari: ${BANNED_PHRASES.join(', ')}`;
}
