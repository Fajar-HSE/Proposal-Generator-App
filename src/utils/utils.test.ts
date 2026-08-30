import { describe, it, expect } from 'vitest';
import { escapeHtml, nl2br } from './dom';
import { extractJson } from './jsonParse';
import { fmtDate, fmtDateRange, safeFilename, parseBullets } from './format';

describe('escapeHtml — XSS hardening (14 innerHTML audit)', () => {
  it('escapes &, <, >, ", \'', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('"quote"')).toBe('&quot;quote&quot;');
    expect(escapeHtml("'single'")).toBe('&#39;single&#39;');
  });
  it('handles null/undefined', () => {
    expect(escapeHtml(null as unknown as string)).toBe('');
    expect(escapeHtml(undefined as unknown as string)).toBe('');
  });
  it('nl2br escapes then converts newlines', () => {
    expect(nl2br('a<b\nc')).toBe('a&lt;b<br/>c');
  });
  it('prevents XSS payload via innerHTML injection point', () => {
    const payload = '<img src=x onerror=alert(1)>';
    const escaped = escapeHtml(payload);
    expect(escaped).not.toContain('<img');
    expect(escaped).toContain('&lt;img');
  });
});

describe('extractJson — LLM response parsing', () => {
  it('parses plain JSON', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });
  it('strips ```json fences', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });
  it('finds JSON inside prose', () => {
    expect(extractJson('here is json {"a":1} ok')).toEqual({ a: 1 });
  });
  it('returns null on invalid', () => {
    expect(extractJson('no json here')).toBeNull();
    expect(extractJson('')).toBeNull();
  });
});

describe('format utils', () => {
  it('fmtDate formats ISO date', () => {
    expect(fmtDate('2026-09-15')).toContain('September');
  });
  it('fmtDateRange merges same month', () => {
    expect(fmtDateRange('2026-09-15', '2026-09-17')).toBe('15-17 September 2026');
  });
  it('fmtDateRange handles different months', () => {
    const r = fmtDateRange('2026-09-28', '2026-10-02');
    expect(r).toContain('September');
    expect(r).toContain('Oktober');
  });
  it('safeFilename sanitizes', () => {
    expect(safeFilename('Proposal ABC v1.0!')).toBe('proposal-abc-v1-0');
  });
  it('parseBullets splits lines and strips bullets', () => {
    expect(parseBullets('a\n• b\n- c')).toEqual(['a', 'b', 'c']);
  });
});
