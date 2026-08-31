// src/types/index.ts
// Central type definitions for the Proposal Generator app

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'bold' | 'elegant' | 'corporate';

export type AiProvider = 'openai' | 'openrouter' | 'groq' | 'anthropic' | 'custom';

export interface AiSettings {
  provider: AiProvider;
  model: string;
  baseUrl: string;
  apiKey: string;
}

export interface ClientBrief {
  clientIndustry: string;
  companySize: string;
  topPainPoints: string;
  businessGoals: string;
  budgetRange: string;
  decisionTimeline: string;
  decisionMakers: string;
}

export interface Material {
  title: string;
  duration: string;
  method: string;
  description: string;
}

export interface ProposalState {
  template: TemplateId;
  companyName: string;
  organizerName: string;
  organizerLogo: string; // base64 data URL
  proposalTitle: string;
  competencyUnit: string; // legacy single, keep for backward compat
  competencyUnits: string[]; // NEW: multi-unit kompetensi (Tab Materi)
  cta: string;
  // Jadwal Pelatihan
  startDate: string;
  endDate: string;
  trainingStartDate: string;
  trainingEndDate: string;
  trainingStartTime: string;
  trainingEndTime: string;
  // Jadwal Uji Kompetensi
  examStartDate: string;
  examEndDate: string;
  examStartTime: string;
  examEndTime: string;
  venue: string;
  pricePerPerson: string;
  minParticipants: string; // jumlah peserta (now in Peserta merged tab)
  priceNotes: string;
  facilities: string[];
  clientBrief: ClientBrief;
  background: string;
  description: string;
  objectives: string;
  audience: string; // profil peserta (merged)
  audienceCount: string; // jumlah peserta explicit
  requirements: string;
  closing: string;
  materials: Material[];
  // AI-generated insights
  insights: Record<string, AiInsights>;
}

export interface AiInsights {
  headline?: string;
  hooks?: string[];
  differentiators?: string[];
  outcomes?: string[];
  proofPoints?: string[];
  objections?: string[];
  ctaProposal?: string;
  personas?: string[];
}

export type StepId = number | 'settings';

export interface StepConfig {
  id: number;
  title: string;
}

export interface AiStep {
  id: string;
  label: string;
  promptKey: string;
  framework: Framework;
}

export type Framework = 'IIIP' | 'FAB' | 'PERSONA' | 'CHECKLIST' | 'ASSUMPTIVE_CLOSE';

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  provider: string;
}
export type CurrentUser = User;
export interface FirebaseAuthUser {
  uid: string;
  displayName?: string | null;
  email: string | null;
  photoURL?: string | null;
  providerData?: Array<{ providerId: string; displayName?: string; photoURL?: string }>;
  updateProfile?: (p: { displayName?: string }) => Promise<void>;
}

export interface DraftMeta {
  id: string;
  name: string;
  updatedAt: string;
}

export interface DraftPayload extends Omit<ProposalState, 'insights'> {
  template: TemplateId;
  facilities: string[];
  materials: Material[];
}

export type ErrorType =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'conflict'
  | 'business_rule'
  | 'internal'
  | 'external_service';

export class AppError extends Error {
  public type: ErrorType;
  public code?: string;
  constructor(message: string, type: ErrorType, code?: string) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
  }
}

export interface ExportOptions {
  cssMode: 'screen' | 'pdf';
}

export interface RenderData extends Omit<ProposalState, 'insights'> {}

