// src/store/proposalStore.ts
// Proposal state store backed by localStorage

import { storage } from '../utils/storage';
import type { ProposalState, TemplateId, ClientBrief, Material } from '../types';

const DEFAULT_STATE: ProposalState = {
  template: 'modern',
  companyName: '',
  organizerName: '',
  organizerLogo: '',
  proposalTitle: '',
  competencyUnit: '',
  competencyUnits: [],
  cta: '',
  startDate: '',
  endDate: '',
  trainingStartDate: '',
  trainingEndDate: '',
  trainingStartTime: '',
  trainingEndTime: '',
  examStartDate: '',
  examEndDate: '',
  examStartTime: '',
  examEndTime: '',
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
  audienceCount: '',
  requirements: '',
  closing: '',
  materials: [],
  insights: {},
};

export const proposalStore = {
  get(): ProposalState {
    const raw = storage.get<Partial<ProposalState>>('proposal', {}) as Partial<ProposalState>;
    const merged: ProposalState = { ...DEFAULT_STATE, ...raw } as ProposalState;
    // Backward compat: single competencyUnit -> array
    if ((!merged.competencyUnits || merged.competencyUnits.length === 0) && merged.competencyUnit) {
      merged.competencyUnits = [merged.competencyUnit];
    }
    // Ensure array
    if (!Array.isArray(merged.competencyUnits)) merged.competencyUnits = [];
    // Backward compat jadwal
    if (!merged.trainingStartDate && merged.startDate) merged.trainingStartDate = merged.startDate;
    if (!merged.trainingEndDate && merged.endDate) merged.trainingEndDate = merged.endDate;
    return merged;
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
