// src/store/proposalStore.ts
// Proposal state store backed by localStorage

import { storage } from '../utils/storage';
import type { ProposalState, TemplateId, ClientBrief, Material } from '../types';

const DEFAULT_STATE: ProposalState = {
  template: 'modern',
  companyName: '',
  organizerName: '',
  proposalTitle: '',
  competencyUnit: '',
  cta: '',
  startDate: '',
  endDate: '',
  venue: '',
  pricePerPerson: '',
  minParticipants: '',
  priceNotes: '',
  facilities: [],
  clientBrief: {
    clientIndustry: '',
    companySize: '',
    topPainPoints: '',
    businessGoals: '',
    budgetRange: '',
    decisionTimeline: '',
    decisionMakers: '',
  },
  background: '',
  description: '',
  objectives: '',
  audience: '',
  requirements: '',
  closing: '',
  materials: [],
  insights: {},
};

export const proposalStore = {
  get(): ProposalState {
    return { ...DEFAULT_STATE, ...storage.get<Partial<ProposalState>>('proposal', {}) };
  },

  set(state: Partial<ProposalState>): void {
    const current = this.get();
    storage.set('proposal', { ...current, ...state });
  },

  reset(): void {
    storage.remove('proposal');
  },

  get template(): TemplateId {
    return this.get().template;
  },
  set template(v: TemplateId) {
    this.set({ template: v });
  },

  get clientBrief(): ClientBrief {
    return this.get().clientBrief || DEFAULT_STATE.clientBrief!;
  },
  set clientBrief(v: ClientBrief) {
    this.set({ clientBrief: v });
  },

  get materials(): Material[] {
    return this.get().materials || [];
  },
  set materials(v: Material[]) {
    this.set({ materials: v });
  },

  get facilities(): string[] {
    return this.get().facilities || [];
  },
  set facilities(v: string[]) {
    this.set({ facilities: v });
  },

  get insights(): Record<string, unknown> {
    return this.get().insights || {};
  },
  setInsight(key: string, value: unknown): void {
    const current = this.get();
    this.set({ insights: { ...(current.insights as Record<string, unknown>), [key]: value } as Record<string, import('../types').AiInsights> });
  },
  getInsight(key: string): unknown | null {
    return (this.get().insights as Record<string, unknown>)?.[key] ?? null;
  },
};
