import type { ReachState, Tile } from './types';

const TIMEOUT_MS = 4000;

/**
 * Asks whether an app answers from where the visitor is. `no-cors` yields an opaque
 * response for any host that replies at all (no CORS setup needed on the apps), while a
 * host that does not resolve or does not answer (a tailnet address from the public
 * internet) rejects. `cache: no-store` keeps a stale success out of the picture.
 */
export const probe = async (url: string): Promise<ReachState> => {
  try {
    await fetch(url, {
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return 'ok';
  } catch {
    return 'unreachable';
  }
};

/** Probes every tile that asks for it, reporting each result as it lands. */
export const probeAll = (tiles: Tile[], onResult: (tile: Tile, state: ReachState) => void): void => {
  for (const tile of tiles) {
    if (!tile.probe) continue;
    onResult(tile, 'probing');
    void probe(tile.href).then((state) => onResult(tile, state));
  }
};
