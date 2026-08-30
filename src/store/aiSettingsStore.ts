// src/store/aiSettingsStore.ts
// AI settings store (provider, model, base URL, API key)

import { storage } from '../utils/storage';
import type { AiSettings, AiProvider } from '../types';

const DEFAULT_SETTINGS: AiSettings = {
  provider: 'openrouter',
  model: 'anthropic/claude-3.5-sonnet',
  baseUrl: '',
  apiKey: '',
};

const PROVIDER_DEFAULTS: Record<AiProvider, { model: string; baseUrl: string }> = {
  openai: { model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
  openrouter: { model: 'anthropic/claude-3.5-sonnet', baseUrl: 'https://openrouter.ai/api/v1' },
  groq: { model: 'llama-3.1-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1' },
  anthropic: { model: 'claude-3-5-sonnet-20241022', baseUrl: 'https://api.anthropic.com/v1' },
  custom: { model: '', baseUrl: '' },
};

export const aiSettings = {
  get(): AiSettings {
    const stored = storage.get<Partial<AiSettings>>('ai', {});
    return { ...DEFAULT_SETTINGS, ...stored };
  },

  set(settings: Partial<AiSettings>): void {
    storage.set('ai', { ...this.get(), ...settings });
  },

  applyProviderDefaults(provider: AiProvider): void {
    const defaults = PROVIDER_DEFAULTS[provider];
    if (defaults) {
      this.set({ provider, model: defaults.model, baseUrl: defaults.baseUrl });
    } else {
      this.set({ provider });
    }
  },

  clearApiKey(): void {
    this.set({ apiKey: '' });
  },
};
