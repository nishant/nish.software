import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReachState, SiteHealth, Tile } from './types';

vi.mock('./status', () => ({ fetchStatus: vi.fn() }));

import { probe, probeAll } from './probe';
import { fetchStatus } from './status';

const mockedStatus = vi.mocked(fetchStatus);

const tile = (id: string, over: Partial<Tile> = {}): Tile => ({
  id,
  name: id,
  blurb: '',
  href: `https://${id}.nish.software/`,
  icon: 'code',
  accent: 'emerald',
  tailnetOnly: false,
  probe: true,
  ...over,
});
const health = (state: SiteHealth['state']): SiteHealth => ({ state, uptime24h: 1, checkedAt: 1 });

const collect = () => {
  const calls: [string, ReachState][] = [];
  return { calls, cb: (t: Tile, s: ReachState) => void calls.push([t.id, s]) };
};

beforeEach(() => {
  mockedStatus.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('probe', () => {
  it('is ok when fetch resolves, using no-cors', async () => {
    const f = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', f);
    expect(await probe('https://x.nish.software/')).toBe('ok');
    expect(f.mock.calls[0][0]).toBe('https://x.nish.software/');
    expect(f.mock.calls[0][1].mode).toBe('no-cors');
    expect(f.mock.calls[0][1].credentials).toBe('omit');
  });
  it('is unreachable when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('x')));
    expect(await probe('https://x.nish.software/')).toBe('unreachable');
  });
});

describe('probeAll', () => {
  it('uses status for covered hosts, probes the rest, ignores non-probe and soon tiles', async () => {
    mockedStatus.mockResolvedValue(new Map([['a.nish.software', health('degraded')]]));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({}));
    const { calls, cb } = collect();
    await probeAll([tile('a'), tile('b'), tile('c', { probe: false }), tile('d', { soon: true })], cb);
    expect(calls).toContainEqual(['a', 'probing']);
    expect(calls).toContainEqual(['a', 'degraded']);
    expect(calls).toContainEqual(['b', 'ok']);
    expect(calls.some(([id]) => id === 'c' || id === 'd')).toBe(false);
  });

  it('falls back to probing everything when status is null', async () => {
    mockedStatus.mockResolvedValue(null);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('x')));
    const { calls, cb } = collect();
    await probeAll([tile('a')], cb);
    expect(calls.at(-1)).toEqual(['a', 'unreachable']);
  });

  it('tailnet tile: idle when permission is not granted', async () => {
    mockedStatus.mockResolvedValue(null);
    const f = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', f);
    vi.stubGlobal('navigator', { permissions: { query: vi.fn().mockResolvedValue({ state: 'prompt' }) } });
    const { calls, cb } = collect();
    await probeAll([tile('t', { tailnetOnly: true })], cb);
    expect(calls).toEqual([['t', 'idle']]);
    expect(f).not.toHaveBeenCalled();
  });

  it('tailnet tile: probed when granted, or when the permission query throws', async () => {
    mockedStatus.mockResolvedValue(null);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({}));
    vi.stubGlobal('navigator', { permissions: { query: vi.fn().mockResolvedValue({ state: 'granted' }) } });
    let r = collect();
    await probeAll([tile('t', { tailnetOnly: true })], r.cb);
    expect(r.calls).toEqual([
      ['t', 'probing'],
      ['t', 'ok'],
    ]);

    vi.stubGlobal('navigator', { permissions: { query: vi.fn().mockRejectedValue(new TypeError('x')) } });
    r = collect();
    await probeAll([tile('t', { tailnetOnly: true })], r.cb);
    expect(r.calls.at(-1)).toEqual(['t', 'ok']);
  });
});
