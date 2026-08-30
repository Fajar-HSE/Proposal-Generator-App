// src/utils/jsonParse.ts
// Safe JSON extraction from LLM responses

export function extractJson<T = unknown>(text: string): T | null {
  if (!text) return null;

  let trimmed = text.trim();

  // Remove markdown code fences
  if (trimmed.startsWith('```json')) {
    trimmed = trimmed.slice(7);
    const lastBacktick = trimmed.lastIndexOf('```');
    if (lastBacktick !== -1) trimmed = trimmed.slice(0, lastBacktick);
    trimmed = trimmed.trim();
  } else if (trimmed.startsWith('```')) {
    trimmed = trimmed.slice(3);
    const lastBacktick = trimmed.lastIndexOf('```');
    if (lastBacktick !== -1) trimmed = trimmed.slice(0, lastBacktick);
    trimmed = trimmed.trim();
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (e) {
    // Search for JSON object in text
    const start = trimmed.indexOf('{');
    if (start === -1) return null;

    let depth = 0;
    let end = -1;
    for (let i = start; i < trimmed.length; i++) {
      if (trimmed[i] === '{') depth++;
      else if (trimmed[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) return null;
    const maybeJson = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(maybeJson) as T;
    } catch {
      return null;
    }
  }
}
