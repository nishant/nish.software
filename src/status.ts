import type { SiteHealth } from './types';

// bars=0 drops the 90-day history the hub does not use: ~2 KB instead of ~60 KB.
export const STATUS_API = 'https://status.nish.software/api/public?bars=0';

const TIMEOUT_MS = 3000;

const STATES: Record<string, SiteHealth['state']> = {
  up: 'ok',
  down: 'down',
  // failing = missed one check (status calls it down after two in a row).
  failing: 'degraded',
  warn: 'degraded',
  degraded: 'degraded',
  slow: 'degraded',
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Asks status.nish.software what it knows about every host. The JSON is untrusted, so each
 * field is type-checked. Resolves to host -> health, or null when status did not answer
 * usefully (network or CORS error, non-2xx, bad JSON, timeout, stale data, nothing mapped).
 */
export const fetchStatus = async (): Promise<Map<string, SiteHealth> | null> => {
  let body: unknown;
  try {
    const res = await fetch(STATUS_API, {
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    body = await res.json();
  } catch {
    return null;
  }
  if (!isRecord(body) || !Array.isArray(body.sites)) return null;

  // Server clock only: a monitor that has not finished a round in 3 intervals is stuck.
  const { generatedAt, lastRound, intervalMin } = body;
  if (finite(generatedAt) && finite(lastRound) && finite(intervalMin) && generatedAt - lastRound > 3 * intervalMin * 60_000) {
    return null;
  }

  const hosts = new Map<string, SiteHealth>();
  for (const site of body.sites as unknown[]) {
    if (!isRecord(site) || typeof site.host !== 'string' || site.host === '') continue;
    const state = typeof site.state === 'string' ? STATES[site.state] : undefined;
    if (!state) continue;
    const d1 = isRecord(site.uptime) ? site.uptime.d1 : undefined;
    hosts.set(site.host, {
      state,
      uptime24h: finite(d1) ? Math.min(1, Math.max(0, d1)) : null,
      checkedAt: finite(site.checkedAt) ? site.checkedAt : finite(lastRound) ? lastRound : Date.now(),
    });
  }
  return hosts.size > 0 ? hosts : null;
};
