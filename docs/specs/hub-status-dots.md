# Hub dots from status.nish.software

Status: in progress · Slug: hub-status-dots · Date: 2026-10-30 · Size: medium
Repos: nish.software (spec lives here). nishant/status needs a one-line CORS change that this
session cannot push (see Release).
ROADMAP: `ROADMAP.md`, "Hub dots from status.nish.software"

## Goal
Today each hub tile's dot comes from a `no-cors` fetch from the visitor's browser, which only says
"something answered", and tailnet tiles get no dot at all in Chrome. status.nish.software already
checks every site every 5 minutes from the PC. The hub should show what status knows: one fetch,
three states, the 24 h uptime in a tooltip, for every tile including tailnet ones.

1. On load and on Recheck the hub makes exactly one request to `https://status.nish.software/api/public`
   (CORS, no credentials, no cache) and maps each tile to its `sites[]` entry by host.
2. A tile with a status entry shows one of three states: Healthy (green dot), Degraded (amber dot),
   Down (red dot). Tailnet tiles get the same dots.
3. On cards (600px and up) hovering the status pill, or keyboard-focusing the tile link, shows a
   tooltip: "<pct> uptime in the last 24 h" and "Checked <n> min ago by status.nish.software".
4. When status does not answer (network error, CORS block, non-2xx, bad JSON, timeout after 3 s,
   stale data), or has no entry for a tile's host, that tile falls back to the current `no-cors`
   probe, unchanged.
5. A tile status reports as Down behaves like an unreachable one on click: a toast instead of a
   navigation, with an "open it anyway" link.

## Out of scope
- Any change to status (`/api/public` shape, the CORS header itself): not pushable from here.
- Showing uptime on the phone row layout (under 600px the label is already visually hidden; there is
  no hover on touch).
- Auto-refresh on a timer, incidents, the 7/30 day numbers, the `overall` field.

## Decisions
- One fetch per round, not per tile: the response already carries every host (14 sites, ~60 KB raw,
  brotli on the wire). The tile maps by `new URL(href).host` (`hostOf` in `src/util.ts`).
- State mapping: `up` → ok, `down` → down, `warn` | `degraded` | `slow` → degraded. Any other value
  (`unknown`, `pending`, missing) → no entry for that host, so the tile falls back to the probe.
  status's UI uses `up`, `down` and `warn` today; the extra spellings are cheap insurance.
- Stale guard: if `generatedAt - lastRound > 3 * intervalMin * 60000` the monitor is stuck, so the
  whole response counts as "status did not answer". Server time only; the visitor's clock is not
  trusted for this.
- Timeout 3 s for status (the probe keeps its 4 s). Worst case on a dead status: 3 s + 4 s.
- Credentials `omit`, `mode: 'cors'`, `cache: 'no-store'`. The JSON is untrusted: every field is
  type-checked, and all text reaches the DOM through `textContent`, never `innerHTML`.
- Down tiles: opacity 0.7, no desaturation (the red dot must stay red), no hover lift, click shows
  the toast. Degraded tiles look like ok tiles apart from the dot and label.
- Uptime formatting: `1` → `100%`; otherwise floor to one decimal (`0.99961` → `99.9%`, never a
  rounded-up `100%`). `null` → "No uptime data for the last 24 h".
- The tooltip is the @nish/ui `.nish-tooltip` (same as the Tailnet badge), placed above the status
  pill and aligned to its right edge. The link's `overflow: hidden` would clip a tooltip that leaves
  the card; above-and-end keeps it inside the 188px card. Hidden under 600px.
- Until status ships the CORS header, the CORS request fails and every tile falls back: the live hub
  then behaves exactly as today plus one console error. The visual test configs ignore that error.

## Current state
- `src/probe.ts`: `probe(url)` (no-cors fetch, 4 s) and `probeAll(tiles, onResult)`. Tailnet tiles
  are probed only when `navigator.permissions.query({name: 'local-network-access'})` is `granted` or
  throws; otherwise `onResult(tile, 'idle')`.
- `src/types.ts`: `ReachState = 'idle' | 'probing' | 'ok' | 'unreachable' | 'soon'`.
- `src/render/tiles.ts`: `STATUS_LABEL`, `DOT_CLASS`, `initialState`, `renderTiles`, `renderTile`,
  `setTileState(root, tile, state)`. The `.status` span (dot + label) sits inside the `<a>`.
  Rendered at build time by `vite.config.ts` (`hubPrerender`), so any new markup must be produced by
  `renderTile` (no DOM created only at runtime for the tooltip shell).
- `src/main.ts`: click handler intercepts `data-reach="unreachable"` and shows `showToast`;
  `runProbes()` drives `probeAll` and the Recheck busy state; `mountTooltips(app)` runs once.
- `src/styles/tiles.css`: reach-state rules at "Reach states" (~line 187), card layout at
  `@media (min-width: 600px)`, hover-lift rules in `@media (min-width: 600px) and (hover: hover)`
  exclude `soon` and `unreachable`; the row-hover rule under 600px excludes them too.
- @nish/ui dot classes: `nish-dot--ok`, `--warn`, `--loss`, `--halo`, `--pulse`. Tooltip:
  `.nish-tooltip > .nish-tooltip-content`, shown on `:hover`/`:focus-within` of `.nish-tooltip`;
  its rules use `:where()` (zero specificity), so a hub rule with a class beats them.
- Live `/api/public` (2026-10-30): `{ generatedAt, lastRound, intervalMin, overall, sites: [{ host,
  kind, exposure, state, ms, checkedAt, uptime: { d1, d7, d30 }, bars: [...] }], incidents }`.
  `uptime.d1` is a 0..1 fraction or null. No `Access-Control-Allow-Origin` header today.
- `fold.visual.json` and `tools/hub.visual.json` list `ignoreConsole` patterns for the visual tests.

## Design

### Data
`src/types.ts` additions:
```ts
/** Probe outcome for a tile. `idle` = no dot (probe: false, or a tailnet host that could not be checked);
 *  `ok` | `degraded` | `down` = what status.nish.software reports (`ok` also = the fallback probe got an answer);
 *  `unreachable` = the fallback probe got no answer; `soon` = not live yet. */
export type ReachState = 'idle' | 'probing' | 'ok' | 'degraded' | 'down' | 'unreachable' | 'soon';

/** One host as status.nish.software reports it. */
export interface SiteHealth {
  state: 'ok' | 'degraded' | 'down';
  /** Fraction 0..1 of checks that passed in the last 24 h; null when status has no data. */
  uptime24h: number | null;
  /** Epoch ms of the check this state comes from. */
  checkedAt: number;
}
```

`src/status.ts` (new):
```ts
export const STATUS_API = 'https://status.nish.software/api/public';
/** Map of host -> health, or null when status did not answer usefully. */
export const fetchStatus = async (): Promise<Map<string, SiteHealth> | null>;
```
- `fetch(STATUS_API, { mode: 'cors', credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(3000) })`
  inside try/catch; any throw → `null`. `!res.ok` → `null`. `await res.json()` throw → `null`.
- Body not an object, or `sites` not an array → `null`.
- If `generatedAt`, `lastRound`, `intervalMin` are all finite numbers and
  `generatedAt - lastRound > 3 * intervalMin * 60_000` → `null`.
- For each entry: skip unless `host` is a non-empty string and the state maps (see Decisions).
  `uptime24h` = `uptime.d1` if a finite number, clamped to [0, 1], else `null`. `checkedAt` =
  `checkedAt` if a finite number, else `lastRound` if a finite number, else `Date.now()`.
- Empty map → `null`.

### Flow (`src/probe.ts`)
```ts
export const probeAll = async (
  tiles: Tile[],
  onResult: (tile: Tile, state: ReachState, health?: SiteHealth) => void,
): Promise<void>;
```
1. `live = tiles.filter((t) => t.probe && !t.soon)`.
2. For each non-tailnet tile in `live`: `onResult(tile, 'probing')` (as today). Tailnet tiles keep
   what they show until their result arrives.
3. `const health = await fetchStatus();`
4. For each tile in `live`, in parallel: `const h = health?.get(hostOf(tile.href))`. If `h`:
   `onResult(tile, h.state, h)`. Else run today's per-tile logic unchanged (tailnet permission
   check → `idle`, or `probing` then `probe(tile.href)`). Call `canProbeTailnet()` lazily, at most
   once per round, and only if some tailnet tile needs the fallback.
5. Resolve when every tile has a result. `probe()` stays exported and unchanged.

### UI (`src/render/tiles.ts`, `src/styles/tiles.css`)
Labels (`STATUS_LABEL`): idle `''`, probing `Checking`, ok `Healthy`, degraded `Degraded`,
down `Down`, unreachable `Not reachable from here` (tailnet tile: `Tailnet only`, as today), soon `''`.

Dots (`DOT_CLASS`): ok `nish-dot nish-dot--ok nish-dot--halo`; degraded
`nish-dot nish-dot--warn nish-dot--halo`; down `nish-dot nish-dot--loss nish-dot--halo`; probing,
idle, unreachable, soon unchanged.

Markup: the `.status` span becomes
```html
<span class="status nish-tooltip nish-tooltip--end" data-status>
  <span class="status__dot …" aria-hidden="true"></span>
  <span class="status__label">…</span>
  <span class="nish-tooltip-content status__tip" role="tooltip" id="tip-status-<id>" hidden>
    <span class="status__tip-line"></span><span class="status__tip-line"></span>
  </span>
</span>
```
and the `<a>` gets `aria-describedby="tip-status-<id>"` (non-soon tiles only).

`setTileState(root, tile, state, health?)`:
- Sets `data-reach`, dot class and label as today (new states included).
- If `health` is given: line 1 = `formatUptime(health.uptime24h)`; line 2 =
  `Checked ${formatAgo(health.checkedAt)} by status.nish.software`; remove `hidden` from the tip.
  Otherwise empty both lines and set `hidden`. Text via `textContent` only.
- `formatUptime(u)`: `null` → `No uptime data for the last 24 h`; `1` → `100% uptime in the last 24 h`;
  else `${(Math.floor(u * 1000) / 10).toFixed(1)}% uptime in the last 24 h`.
- `formatAgo(ms)`: `m = Math.max(0, Math.round((Date.now() - ms) / 60000))`; `m < 1` → `just now`;
  `m < 60` → `${m} min ago`; else `${Math.round(m / 60)} h ago`.
- Export `formatUptime` and `formatAgo` from `src/render/tiles.ts`.

CSS (`src/styles/tiles.css`):
- `.status__tip[hidden] { display: none; }` (beats the `:where()` show rule).
- `.status__tip-line { display: block; }` and `.status__tip { max-width: min(240px, 100vw - 32px); }`.
- Under 600px: `.status__tip { display: none; }` (the row clips it and has no hover).
- 600px and up: `.tile__link:focus-visible .status__tip:not([hidden]) { display: block; }`.
- `.tile[data-reach='degraded'] .status, .tile[data-reach='down'] .status { color: var(--nish-hi2); }`
- `.tile[data-reach='down'] { opacity: 0.7; }` (no filter).
- Add `down` next to every `unreachable` exclusion in the hover rules (row hover tint, card lift,
  `::after` glow, tailnet badge lift).
- No hex values; only `--nish-*` roles.

### Click (`src/main.ts`)
- Intercept when `tileEl.dataset.reach` is `unreachable` or `down`.
- `down` toast: `<strong>host</strong>` + ` is down right now, per status.nish.software. You can still ` + `<a>open it anyway</a>` + `.`
- `unreachable` toast: unchanged.
- `runProbes` passes the health through: `probeAll(tiles, (tile, state, health) => setTileState(app, tile, state, health))`.

### Visual tests
Add `"CORS policy"` to the `ignoreConsole` arrays in `fold.visual.json` and `tools/hub.visual.json`
(their setup forces `data-reach="ok"`, so screenshots are unaffected).

### Security
- Public, read-only, unauthenticated endpoint; `credentials: 'omit'` so no cookies cross over.
- Untrusted JSON: type-checked field by field; only `textContent` writes; the host lookup is a Map
  keyed by the hub's own config, so a hostile entry can at most set a dot on a configured tile.
- status side (not in this PR): `Access-Control-Allow-Origin: https://nish.software` exactly, plus
  `Vary: Origin`, only on `GET /api/public`. Never `*`.

### Performance
One request per round instead of up to 10; ~60 KB raw, brotli-compressed by Cloudflare. Parsing is
synchronous and trivial. Nothing blocks first paint (the prerendered page already shows "Checking").

### Mobile / themes
Rows under 600px: only the dot changes colour (ok green, degraded amber, down red); no tooltip.
Cards at 840 and 1440: the label shows the word; the tooltip appears on hover/focus inside the card.
Light and dark come from the `--nish-*` fills. Touch targets unchanged.

## Tasks

### T1 Status-first dots
- Repo / checkout: nish.software at `/home/user/nish.software` (branch `claude/hub-status-dots`)
- Owns: `src/status.ts` (new), `src/probe.ts`, `src/types.ts`, `src/render/tiles.ts`, `src/main.ts`,
  `src/styles/tiles.css`, `fold.visual.json`, `tools/hub.visual.json`, `README.md`
- Reads: `src/util.ts`, `src/config.ts`, `vite.config.ts`, `node_modules/@nish/ui/dist/nish-components.css`
- Depends on: none
- Change: everything under Design, in that order (types → status.ts → probe.ts → tiles.ts → main.ts
  → CSS → visual configs). README: add a `src/status.ts` row to the table and rewrite the
  `src/probe.ts` row to say the probe is now the fallback when status does not answer.
- Edge cases: status throws / times out / CORS-blocked / 500 / invalid JSON / `sites` missing / stale
  → every live tile falls back; a host missing from status → only that tile falls back; `uptime.d1`
  null → "No uptime data" line; `checkedAt` in the future → "just now"; a tailnet tile with a
  status entry gets its dot even when the local-network permission is not granted; Recheck while a
  round runs is still ignored (`checking` flag, unchanged).
- Acceptance: `npm run build` passes (typecheck + build). There is no test runner in this repo, so
  also run a throwaway Node check of the mapping (not committed): build, then in a browser at
  `npm run preview` with the status request routed (Playwright `page.route`) to (a) a fixture with
  `up`, `warn`, `down` entries for three tile hosts, (b) a 500, and confirm (a) the three tiles get
  `data-reach` ok/degraded/down with the right labels and tooltip text and the tailnet tile gets a
  dot, (b) all tiles fall back to the probe.

## Waves
W1: T1.

## Review focus
- Fallback correctness: no tile is ever left on "Checking"; no double `probing` flicker for tiles
  status covered.
- Untrusted JSON handling and `textContent`-only writes.
- Tooltip clipping and placement on cards at 840 and 1440, light and dark; nothing new visible at 360.
- The prerendered markup (`vite.config.ts` uses `renderTiles`) matches what `setTileState` expects.

## Release
1. nish.software: PR, merge, watch `deploy.yml`, then verify https://nish.software at 360/840/1440
   light and dark. Without the CORS header live, expect the fallback path (same as today).
2. nishant/status (another session or Nish): on `GET /api/public` only, send
   `Access-Control-Allow-Origin: https://nish.software` and `Vary: Origin` when the request's
   `Origin` is exactly `https://nish.software`; no header otherwise; never `*`. No shape change.
   Then the hub switches to status-backed dots with no hub redeploy.

## Open questions for the research phase
None.
