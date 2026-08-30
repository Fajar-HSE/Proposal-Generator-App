// src/services/aiService.ts
import type { AiSettings, AiInsights, ProposalState } from '../types';
import { AppError } from '../types';
import { buildInsightsPrompt, buildSystemPrompt, buildSectionPrompt } from '../lib/prompts';
import { extractJson } from '../utils/jsonParse';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
export interface GenerateResult { text: string; insights: AiInsights | null; }

class RateLimiter {
  private calls: number[] = [];
  constructor(private maxCalls = 10, private windowMs = 60000) {}
  canCall(): boolean {
    const now = Date.now();
    this.calls = this.calls.filter(t => now - t < this.windowMs);
    return this.calls.length < this.maxCalls;
  }
  record(): void { this.calls.push(Date.now()); }
  remainingTime(): number {
    if (!this.calls.length) return 0;
    return Math.max(0, this.windowMs - (Date.now() - Math.min(...this.calls)));
  }
}
const rateLimiter = new RateLimiter(10, 60000);

export async function callAi(
  cfg: AiSettings,
  messages: ChatMessage[],
  opts: { temperature?: number; responseFormat?: { type: string } } = {},
): Promise<string> {
  if (!cfg.apiKey) throw new AppError('API Key belum diisi', 'validation', 'NO_API_KEY');
  if (!rateLimiter.canCall()) {
    const s = Math.ceil(rateLimiter.remainingTime() / 1000);
    throw new AppError(`Rate limit. Coba lagi dalam ${s}s`, 'external_service', 'RATE_LIMIT');
  }
  const baseUrl = (cfg.baseUrl || '').replace(/\/+$/, '');
  if (!baseUrl) throw new AppError('Base URL belum diisi', 'validation', 'NO_BASE_URL');
  rateLimiter.record();
  const payload: Record<string, unknown> = {
    model: cfg.model, messages, temperature: opts.temperature ?? 0.7,
  };
  if (opts.responseFormat && cfg.provider === 'openai' && opts.responseFormat.type === 'json_object') {
    (payload as Record<string, unknown>).response_format = { type: 'json_object' };
  }
  // Prefer backend proxy if configured (keeps API key server-side)
  const useProxy = cfg.baseUrl.startsWith('/api/proxy');
  const url = useProxy ? cfg.baseUrl : `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!useProxy) headers['Authorization'] = `Bearer ${cfg.apiKey}`;

  const res = await fetch(url, {
    method: 'POST', headers, body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new AppError(`AI API ${res.status}: ${t.slice(0,200)}`, 'external_service', String(res.status));
  }
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data?.choices?.[0]?.message?.content ?? '';
  if (!content) throw new AppError('Respons kosong', 'external_service', 'EMPTY');
  return content;
}

export async function generateSection(
  cfg: AiSettings, sectionKey: string, proposalData: ProposalState,
): Promise<GenerateResult> {
  let research: AiInsights | null = null;
  try {
    const txt = await callAi(cfg, [
      { role: 'system', content: 'Output HANYA JSON valid.' },
      { role: 'user', content: buildInsightsPrompt(sectionKey, proposalData) },
    ], { temperature: 0.4 });
    research = extractJson<AiInsights>(txt);
  } catch { /* ignore research failure */ }
  const insightsJson = research ? JSON.stringify(research) : '';
  const sectionText = await callAi(cfg, [
    { role: 'system', content: buildSystemPrompt(sectionKey) },
    { role: 'user', content: buildSectionPrompt(sectionKey, proposalData, insightsJson) },
  ]);
  return { text: sectionText.trim(), insights: research };
}
