// src/lib/monitoring.ts
// Lightweight error monitoring — swap with Sentry when DSN is set

type Breadcrumb = { message: string; level?: string; timestamp: number };

const breadcrumbs: Breadcrumb[] = [];
let dsn: string | null = null;

export function initMonitoring(opts: { dsn?: string } = {}): void {
  dsn = opts.dsn || (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SENTRY_DSN || null;

  window.addEventListener('error', (e) => captureException(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => captureException(e.reason));

  // Also wrap console.error for breadcrumb trail
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    breadcrumbs.push({ message: args.map(String).join(' '), level: 'error', timestamp: Date.now() });
    if (breadcrumbs.length > 20) breadcrumbs.shift();
    origError(...(args as []));
  };

  if (dsn) console.info('[monitoring] Sentry enabled');
  else console.info('[monitoring] Running in stub mode (set VITE_SENTRY_DSN to enable Sentry)');
}

export function captureException(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  breadcrumbs.push({ message: msg, level: 'error', timestamp: Date.now() });

  if (dsn) {
    // In production, send to Sentry endpoint
    fetch(dsn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, stack, breadcrumbs, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  } else {
    console.warn('[monitoring:capture]', msg, stack);
  }
}

export function addBreadcrumb(message: string, level = 'info'): void {
  breadcrumbs.push({ message, level, timestamp: Date.now() });
  if (breadcrumbs.length > 20) breadcrumbs.shift();
}
