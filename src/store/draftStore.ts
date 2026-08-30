// src/store/draftStore.ts
// Drafts store: meta list + payloads

import { storage } from '../utils/storage';
import type { DraftMeta, DraftPayload } from '../types';

const DRAFTS_KEY = 'drafts';
const DRAFTS_META_KEY = 'drafts_meta';

export const draftStore = {
  list(): DraftMeta[] {
    return storage.get<DraftMeta[]>(DRAFTS_META_KEY, []);
  },

  saveMeta(meta: DraftMeta[]): void {
    storage.set(DRAFTS_META_KEY, meta);
  },

  getPayload(id: string): DraftPayload | null {
    const all = storage.get<Record<string, DraftPayload>>(DRAFTS_KEY, {});
    return all[id] || null;
  },

  setPayload(id: string, payload: DraftPayload): void {
    const all = storage.get<Record<string, DraftPayload>>(DRAFTS_KEY, {});
    all[id] = payload;
    storage.set(DRAFTS_KEY, all);
  },

  remove(id: string): void {
    const all = storage.get<Record<string, DraftPayload>>(DRAFTS_KEY, {});
    delete all[id];
    storage.set(DRAFTS_KEY, all);
    const meta = this.list().filter((m) => m.id !== id);
    this.saveMeta(meta);
  },

  save(name: string, payload: DraftPayload): DraftMeta {
    const existing = this.list().find((m) => m.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      const updated: DraftMeta = { ...existing, updatedAt: new Date().toISOString() };
      this.setPayload(existing.id, payload);
      const meta = this.list().map((m) => (m.id === existing.id ? updated : m));
      this.saveMeta(meta);
      return updated;
    } else {
      const id = this.generateId();
      const meta: DraftMeta = { id, name, updatedAt: new Date().toISOString() };
      this.setPayload(id, payload);
      this.saveMeta([meta, ...this.list()]);
      return meta;
    }
  },

  generateId(): string {
    return 'd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  },

  storageSize(): number {
    const payloads = storage.get<Record<string, DraftPayload>>(DRAFTS_KEY, {});
    const meta = this.list();
    return JSON.stringify(payloads).length + JSON.stringify(meta).length;
  },
};
