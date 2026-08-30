// server/proxy.ts
// Minimal Node proxy to keep LLM API keys server-side.
// Run:  node --loader ts-node/esm server/proxy.ts  OR  npm run proxy
// Env:  LLM_API_KEY, LLM_BASE_URL, PORT

import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const ALLOWED_TARGETS = [
  'https://api.openai.com',
  'https://openrouter.ai',
  'https://api.groq.com',
  'https://api.anthropic.com',
];

function isAllowed(url: string): boolean {
  return ALLOWED_TARGETS.some(t => url.startsWith(t));
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (!req.url?.startsWith('/api/proxy')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Rate limiting — simple in-memory per IP (10 req/min)
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60_000;
  const max = 10;
  // @ts-ignore
  globalThis._rl = globalThis._rl || new Map<string, number[]>();
  const map: Map<string, number[]> = (globalThis as unknown as { _rl: Map<string, number[]> })._rl;
  const arr = (map.get(ip) || []).filter(t => now - t < windowMs);
  if (arr.length >= max) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }));
    return;
  }
  arr.push(now); map.set(ip, arr);

  // Read body
  let body = '';
  for await (const chunk of req) body += chunk;
  let parsed: Record<string, unknown> = {};
  try { parsed = body ? JSON.parse(body) : {}; } catch {}

  const targetBase = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  if (!isAllowed(targetBase)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Target not allowed' }));
    return;
  }
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server misconfigured: LLM_API_KEY not set' }));
    return;
  }

  const upstream = await fetch(`${targetBase}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(parsed),
  });
  const text = await upstream.text();
  res.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('content-type') || 'application/json' });
  res.end(text);
});

server.listen(PORT, () => console.log(`[proxy] listening on http://localhost:${PORT} — set LLM_API_KEY and LLM_BASE_URL`));
