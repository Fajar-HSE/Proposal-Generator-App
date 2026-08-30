// src/lib/prompts.ts
import type { ProposalState } from '../types';

const FRAMEWORKS: Record<string, string> = {
  IIIP: 'Gunakan struktur Issue → Impact → Implication → Payoff',
  FAB: 'Gunakan kerangka Feature → Advantage → Benefit',
  PERSONA: 'Gunakan kerangka Persona → Pains → Gains → Channels',
  CHECKLIST: 'Setiap poin harus dapat diverifikasi oleh panitia.',
  ASSUMPTIVE_CLOSE: 'Gunakan assumptive close: asumsikan klien akan lanjut.',
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
];

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
  return `Anda copywriter senior. Framework: ${fw}\nHindari: ${BANNED_PHRASES.join(', ')}\n200-500 kata, bahasa Indonesia persuasif.`;
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
