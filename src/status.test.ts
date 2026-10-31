import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchStatus, STATUS_API } from './status';

const respond = (body: unknown, init: { ok?: boolean } = {}) => ({
  ok: init.ok ?? true,
  json: async () => body,
});
const stub = (r: unknown) => {
  const f = vi.fn().mockResolvedValue(r);
  vi.stubGlobal('fetch', f);
  return f;
};
const one = (site: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
  respond({ sites: [{ host: 'a.nish.software', state: 'up', ...site }], ...extra });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_700_000_000_000);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('fetchStatus', () => {
  it('calls STATUS_API with cors and omitted credentials', async () => {
    const f = stub(one({}));
    await fetchStatus();
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = f.mock.calls[0];
    expect(url).toBe(STATUS_API);
    expect(init.mode).toBe('cors');
    expect(init.credentials).toBe('omit');
  });

  it('maps states', async () => {
    stub(
      respond({
        sites: [
          { host: 'up', state: 'up' },
          { host: 'failing', state: 'failing' },
          { host: 'warn', state: 'warn' },
          { host: 'degraded', state: 'degraded' },
          { host: 'slow', state: 'slow' },
          { host: 'down', state: 'down' },
        ],
      }),
    );
    const m = await fetchStatus();
    expect(m?.get('up')?.state).toBe('ok');
    for (const h of ['failing', 'warn', 'degraded', 'slow']) expect(m?.get(h)?.state).toBe('degraded');
    expect(m?.get('down')?.state).toBe('down');
  });

  it('skips unknown states, non-string and empty hosts, non-objects', async () => {
    stub(
      respond({
        sites: [
          { host: 'good', state: 'up' },
          { host: 'weird', state: 'exploding' },
          { host: 'nostate' },
          { host: 5, state: 'up' },
          { host: '', state: 'up' },
          { state: 'up' },
          null,
          'str',
        ],
      }),
    );
    const m = await fetchStatus();
    expect([...(m?.keys() ?? [])]).toEqual(['good']);
  });

  it('clamps uptime.d1 to [0,1] and nulls it when missing', async () => {
    stub(
      respond({
        sites: [
          { host: 'hi', state: 'up', uptime: { d1: 1.5 } },
          { host: 'lo', state: 'up', uptime: { d1: -2 } },
          { host: 'mid', state: 'up', uptime: { d1: 0.25 } },
          { host: 'none', state: 'up' },
          { host: 'bad', state: 'up', uptime: { d1: '0.5' } },
        ],
      }),
    );
    const m = await fetchStatus();
    expect(m?.get('hi')?.uptime24h).toBe(1);
    expect(m?.get('lo')?.uptime24h).toBe(0);
    expect(m?.get('mid')?.uptime24h).toBe(0.25);
    expect(m?.get('none')?.uptime24h).toBeNull();
    expect(m?.get('bad')?.uptime24h).toBeNull();
  });

  it('checkedAt: site value, else lastRound, else Date.now', async () => {
    stub(
      respond({
        lastRound: 1234,
        sites: [
          { host: 'own', state: 'up', checkedAt: 99 },
          { host: 'round', state: 'up' },
        ],
      }),
    );
    let m = await fetchStatus();
    expect(m?.get('own')?.checkedAt).toBe(99);
    expect(m?.get('round')?.checkedAt).toBe(1234);

    stub(one({}));
    m = await fetchStatus();
    expect(m?.get('a.nish.software')?.checkedAt).toBe(1_700_000_000_000);
  });

  it('returns null on non-2xx', async () => {
    stub(respond({ sites: [{ host: 'a', state: 'up' }] }, { ok: false }));
    expect(await fetchStatus()).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
    expect(await fetchStatus()).toBeNull();
  });

  it('returns null when res.json throws', async () => {
    stub({
      ok: true,
      json: async () => {
        throw new SyntaxError('bad json');
      },
    });
    expect(await fetchStatus()).toBeNull();
  });

  it('returns null when body is not an object or sites is not an array', async () => {
    for (const body of [null, 'x', 42, [], { sites: 'nope' }, { sites: {} }, {}]) {
      stub(respond(body));
      expect(await fetchStatus()).toBeNull();
    }
  });

  it('returns null for a stale round, accepts a fresh one', async () => {
    const sites = [{ host: 'a', state: 'up' }];
    const min = 60_000;
    stub(respond({ sites, generatedAt: 10 * min, lastRound: 10 * min - (3 * 2 * min + 1), intervalMin: 2 }));
    expect(await fetchStatus()).toBeNull();
    stub(respond({ sites, generatedAt: 10 * min, lastRound: 10 * min - 3 * 2 * min, intervalMin: 2 }));
    expect(await fetchStatus()).not.toBeNull();
  });

  it('returns null when no sites map', async () => {
    stub(respond({ sites: [] }));
    expect(await fetchStatus()).toBeNull();
    stub(respond({ sites: [{ host: 'a', state: 'nope' }] }));
    expect(await fetchStatus()).toBeNull();
  });
});
