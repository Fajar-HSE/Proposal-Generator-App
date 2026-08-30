// src/utils/storage.ts
// Thin localStorage wrapper with JSON serialization and safe defaults

const PREFIX = 'pg_';

export const storage = {
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save "${key}" to localStorage:`, e);
    }
  },

  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw == null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.error(`Failed to read "${key}" from localStorage, using default:`, e);
      return defaultValue;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },

  clear(): void {
    localStorage.clear();
  },
};