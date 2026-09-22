import type { ReachState, Tile } from './types';

const TIMEOUT_MS = 4000;

/**
 * Asks whether an app answers from where the visitor is. `no-cors` yields an opaque
 * response for any host that replies at all (no CORS setup needed on the apps), while a
 * host that does not resolve or does not answer rejects. `cache: no-store` keeps a stale
 * success out of the picture.
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

/**
 * Tailnet hosts resolve to 100.x addresses, which Chrome treats as the local network:
 * a public page may only fetch them after a "local network access" permission prompt.
 * We never want to trigger that prompt, so a tailnet tile is pinged only when the
 * browser will allow it silently: permission already granted, or a browser without the
 * concept (the query throws), where the fetch simply works.
 */
const canProbeTailnet = async (): Promise<boolean> => {
  try {
    const status = await navigator.permissions.query({
      name: 'local-network-access' as PermissionName,
    });
    return status.state === 'granted';
  } catch {
    return true;
  }
};

/** Probes every tile that asks for it, reporting each result as it lands. */
export const probeAll = (tiles: Tile[], onResult: (tile: Tile, state: ReachState) => void): void => {
  const tailnetAllowed = canProbeTailnet();
  for (const tile of tiles) {
    if (!tile.probe || tile.soon) continue;
    void (async () => {
      if (tile.tailnetOnly && !(await tailnetAllowed)) {
        // Unknown from here: no dot, no claim. The lock badge already says tailnet.
        onResult(tile, 'idle');
        return;
      }
      onResult(tile, 'probing');
      onResult(tile, await probe(tile.href));
    })();
  }
};
