# Hub UX overhaul: phone list, prerendered page, head metadata

Status: in progress · Slug: ux-overhaul · Date: 2026-10-28 · Size: medium
Repos: nish.software (this spec), checkout `C:\Code\nish.software-ux-overhaul` on branch `ux-overhaul`
ROADMAP: `ROADMAP.md` → "UX overhaul from the 2026-10-28 audit"

## Goal

The 2026-10-28 audit (screenshots at 360x780, 840x900 and 1440x900, light and dark) found the hub
in good shape on desktop, but long and slow on the Galaxy Z Fold 7 cover screen. Nine 190-240px
cards make the page about 2600px tall at 360, with about 2.5 apps per screen. The hero's Resume
pill wraps onto its own line. The page is blank until the JS runs. Link previews show no image,
the home-screen install has no icon, and light mode ships two conflicting theme-color metas.
This overhaul makes the phone layout a compact app list (about 7 apps per screen), prerenders the
page at build time, and fixes the small issues the audit listed.

Outcomes:
1. Under 600px the apps are one opaque bordered list card of 72px rows: a 40px accent icon, the name
   with an inline status dot, a 2-line clamped blurb and a chevron. Tailnet is a lock glyph with
   a 44px tap target. "Soon" rows come last, dimmed, and are not links. No host line.
2. From 600px the apps are today's cards: 2 columns at 600-1023px and 3 columns from 1024px
   (3x3 at 1440, no orphan). A lone last card spans the full row.
3. At 360 the three hero pills (GitHub, LinkedIn, Resume) sit on one row. Under 600px the footer
   shows only the copyright line.
4. `dist/index.html` contains the full page markup (header, tiles, footer), so the first paint is
   the page, not an empty background. `main.ts` only wires behavior.
5. The Tailnet badge has a 44px tall hit area. A soon tile shows only the "Soon" badge, with no
   duplicate "Coming soon" status, so the host is not truncated.
6. `<head>` has one theme-color meta (the one theme-init creates), an apple-touch-icon, a web
   manifest with 192 and 512 icons, and a 1200x630 og:image with Twitter card tags.
7. The status reads "Reachable" (what the probe measures), and a "Recheck" button in the Apps
   header re-runs the probes, with the dots pulsing while it runs.

## Out of scope

- Everything on design.nish.software (the docs-site findings in the same audit): the @nish/ui
  ux-overhaul workflow owns them.
- Anything listed under "Deferred to the v0.7.0 adoption pass" below.
- New tiles, copy changes to blurbs, or changes to `src/config.ts` content.
- Changes to the theme toggle behavior, the probe's tailnet logic, or the deploy pipeline.

## Decisions

- Phone breakpoint is 600px (`max-width: 599.98px` for the row layout), as the audit proposed. Cards from 600px because two 280px+ cards fit there. (default)
- The CSS is written mobile first: the base rules are the row layout, `@media (min-width: 600px)` adds the card layout. Reason: the cover screen is the main device.
- Tile markup becomes one flat CSS grid (no `.tile__top` / `.tile__foot` wrappers) so the same DOM can be laid out as a row or as a card with `grid-template-areas`. Reason: no duplicated markup, no JS layout switch.
- The phone list card is opaque `var(--nish-surface)`, not the see-through `--hub-surface`, for readability over the glows (audit overhaul). Cards from 600px keep `--hub-surface`.
- In the row layout the Tailnet lock sits at the right end of the name row, just left of the chevron (absolute position, as the badge already is). Reason: the badge must stay outside the `<a>`, and its position cannot follow a variable-width name. (default)
- Soon tiles are sorted last at render time (stable sort), whatever their order in `config.ts`.
- A lone last card spans the whole row at 2 and 3 columns (`grid-column: 1 / -1`) instead of sitting alone in the first cell. (default)
- Prerendering uses a Vite `transformIndexHtml` plugin that imports the existing pure render functions from `src/render/*.ts`. No SSR framework. `main.ts` keeps a fallback that renders client-side only when `#app` is empty.
- The copyright year is rendered at build time and refreshed by `main.ts` on load (`[data-year]`), so a build from December still shows the right year in January.
- Status label "Online" becomes "Reachable" (the probe only shows the host answered a no-cors fetch from this browser). (from the audit)
- Recheck is a ghost text button, 44px tall, shown only when at least one tile has `probe: true` and is not `soon`. While running it is disabled, `aria-busy="true"`, and reads "Checking…".
- Icons (apple-touch-icon, manifest icons, og:image) are PNGs generated once by `scripts/make-icons.mjs` with Playwright from `C:\Code\ui\node_modules` and committed to `public/`. Playwright is not added to this repo's dependencies. Reason: the site has no runtime or build dependency on an image tool; the PNGs change rarely.
- The static `<meta name="theme-color">` is deleted. theme-init (inlined before it) creates the one meta and sets it per theme. Reason: theme-init looks for an existing meta before the static one is parsed, so both end up in the DOM.
- The sticky/translucent-bar rule for this overhaul does not apply: the hub has no sticky header, sticky bar or fixed bottom bar (the topbar scrolls with the page). Nothing to make opaque. (checked)

## Current state

- Static Vite + TypeScript site, no framework. `index.html` has `<div id="app"></div>`; `src/main.ts:22-28` sets `app.innerHTML` from `renderHeader`, `renderTiles`, `renderFooter`, then wires the theme toggle (`setupTheme`), `mountTooltips`, the click handler for unreachable tiles (toast via `showToast`) and `probeAll`.
- `src/render/header.ts`, `src/render/tiles.ts`, `src/render/footer.ts`: pure functions returning HTML strings. `src/config.ts`: profile, links, 9 tiles (last one, Nishboard, is `soon: true`), `tailnetNote`. `src/icons.ts`: `icon(name, className)` returns an inline SVG string; `IconName` union in `src/types.ts`.
- `src/render/tiles.ts:36-69` renders each tile as `li.tile[data-tile][data-accent][data-reach][data-tailnet?][style=--i]` containing `.tile__link` (`<a>` or, for soon, `<div aria-disabled>`) with `.tile__top` (icon, Soon badge, arrow), `h3.tile__name`, `p.tile__blurb`, `.tile__foot` (`.tile__host`, `.status` with `.status__dot` + `.status__label`), and outside the link the Tailnet badge `span.nish-badge.nish-tooltip.nish-tooltip--bottom.nish-tooltip--end.tile__tailnet[tabindex=0]`.
- `setTileState(root, tile, state)` (`tiles.ts:72-82`) sets `data-reach`, the dot class (`DOT_CLASS`) and the label text (`STATUS_LABEL`, "Tailnet only" for an unreachable tailnet tile).
- `src/probe.ts`: `probe(url)` (no-cors fetch, 4s timeout) and `probeAll(tiles, onResult)` which returns `void`; tailnet tiles are probed only when `local-network-access` is granted, else reported `idle`.
- `src/styles/tiles.css`: accent mapping (`--tile-hue`, `--tile-hue-soft`), `.tiles` grid `repeat(auto-fill, minmax(min(100%, 240px), 1fr))` (4 columns at 1440, Nishboard alone on row 3), `.tile__link` flex column, `min-height: 188px`, see-through `--hub-surface`, top accent hairline (`::before`), hover glow (`::after`), reach-state rules, Tailnet badge absolute at `top: calc(1px + 18px + 21px); right: calc(1px + 18px + 18px + 8px)`.
- `src/styles/layout.css`: page width `min(100% - 2 * var(--nish-gutter), var(--nish-page-max))` (gutter 16px, max 1120px), `.section__head` (flex, `align-items: baseline`), `.section__title`, `.status`, `.status__dot`.
- `src/styles/header.css`: `.topbar` (not sticky), `.hero` padding `clamp(40px, 9vw, 96px) 0 clamp(36px, 6vw, 64px)`, `.hero__tagline` `clamp(26px, 4.6vw, 44px)`, `.hero__links` flex wrap gap 8px, `.pill` 44px tall, padding `0 14px 0 12px`, gap 8px.
- `src/styles/footer.css`: footer with links row and copyright. `src/styles/base.css`: hub-only vars, ambient glows (`body::before`, `body::after`), resets, `.icon`, `rise` entrance animation on `.tile` and `.hero > *` (staggered by `--i`), reduced-motion override. `html { scroll-behavior: smooth }` unconditionally.
- `vite.config.ts`: `nishThemeInit()` plugin replaces `<!-- nish-theme-init -->` in `index.html` with @nish/ui's `theme-init.js` (order `pre`). `tsconfig.json` includes only `src`, so `vite.config.ts` is not typechecked by `tsc`.
- `index.html` has a static `<meta name="theme-color" content="#0a0b0f" />` after the theme-init marker: theme-init's `querySelector('meta[name="theme-color"]')` runs before that tag is parsed, creates its own meta, and the static one follows, so light mode has `['#f7f6f3', '#0a0b0f']`. No apple-touch-icon (404), no manifest, no og:image. `public/` has `favicon.svg` (64x64, `#0a0b0f` rounded square with an indigo-to-emerald "N") and `resume.pdf`.
- @nish/ui v0.6.1 static classes in use: `nish-btn`, `nish-btn--soft`, `nish-btn--ghost`, `nish-badge`, `nish-dot` (+ `--ok`, `--warn`, `--halo`, `--pulse`), `nish-theme-btn`, `nish-tooltip`, `nish-skip-link`. There is no `sr-only` class in @nish/ui's CSS; define the visually-hidden rules locally.
- Tokens used: `--nish-surface`, `--nish-elevated`, `--nish-line`, `--nish-line-strong`, `--nish-hi`, `--nish-hi2`, `--nish-hi3`, `--nish-radius-lg` (20px), `--nish-shadow-card`, `--nish-text-xs/sm/base/lg`, `--nish-tap-min` (44px), `--nish-dur-fast/med`, `--nish-ease-out`.
- Checks: `npm run typecheck` and `npm run build` (`tsc --noEmit && vite build`). CI (`.github/workflows/deploy.yml`) runs `npm ci`, typecheck, build; push to `master` deploys.
- Visual check: `C:\Code\ui\tools\visual-check.mjs` with this repo's `tools/hub.visual.json` (expects `npm run preview` on port 4173).

## Design

### Data
Not affected (no new config fields). `src/types.ts` gains `'chevron'` in `IconName`. `probeAll` returns `Promise<void>`.

### UI

#### Tile markup (T2, `src/render/tiles.ts`)
Each tile renders as below (attribute order free; `--i` is the index after sorting):

```html
<li class="tile" data-tile="trading" data-accent="emerald" data-reach="idle" data-tailnet style="--i:0">
  <a class="tile__link" href="https://trading.nish.software" data-tile-link>
    <span class="tile__icon">{icon(t.icon)}</span>
    <span class="tile__arrow">{icon('arrow')}</span>
    <h3 class="tile__name">Trading</h3>
    <span class="status" data-status>
      <span class="status__dot nish-dot" aria-hidden="true"></span>
      <span class="status__label"></span>
    </span>
    <p class="tile__blurb">…</p>
    <span class="tile__host">trading.nish.software</span>
    <span class="tile__chevron" aria-hidden="true">{icon('chevron')}</span>
  </a>
  <!-- only when tailnetOnly; unchanged except the text span gets a class -->
  <span class="nish-badge nish-tooltip nish-tooltip--bottom nish-tooltip--end tile__tailnet" tabindex="0" aria-describedby="tip-tailnet-trading">{icon('lock','icon icon--xs')}<span class="tile__tailnet-text">Tailnet</span><span class="nish-tooltip-content" role="tooltip" id="tip-tailnet-trading">Only reachable on my tailnet</span></span>
</li>
```

Soon tile differences: `.tile__link` is `<div class="tile__link" data-tile-link aria-disabled="true">`; no `.tile__arrow`, no `.status`, no `.tile__chevron`; instead `<span class="nish-badge tile__badge">Soon</span>` right after `.tile__icon`.

`STATUS_LABEL` becomes `{ idle: '', probing: 'Checking', ok: 'Reachable', unreachable: 'Not reachable from here', soon: '' }`. "Tailnet only" stays the label for an unreachable tailnet tile.

Apps section header:

```html
<div class="section__head">
  <h2 class="section__title" id="apps-heading">Apps</h2>
  <button class="nish-btn nish-btn--ghost section__action" type="button" data-action="recheck">Recheck</button>
</div>
```
The button is rendered only when `tiles.some((t) => t.probe && !t.soon)`.

#### Tile layout per width (T2, `src/styles/tiles.css`)

Under 600px (base rules, the row layout):
- `.tiles`: one column, `gap: 0`, `border: 1px solid var(--nish-line)`, `border-radius: var(--nish-radius-lg)`, `background: var(--nish-surface)` (opaque), `box-shadow: var(--nish-shadow-card)`. No `overflow: hidden` on `.tiles` (it would clip the Tailnet tooltip).
- `.tile + .tile { border-top: 1px solid var(--nish-line); }`. First tile and its link get the top corner radii `calc(var(--nish-radius-lg) - 1px)`; last tile and its link the bottom ones (so hover backgrounds do not poke out of the rounded card).
- `.tile__link`: `display: grid; grid-template-columns: 40px minmax(0, max-content) 1fr auto; grid-template-areas: "icon name status chev" "icon blurb blurb chev"; column-gap: 12px; row-gap: 2px; align-items: center; min-height: 72px; padding: 14px 16px; position: relative; overflow: hidden; background: linear-gradient(90deg, color-mix(in oklab, var(--tile-hue) 6%, transparent), transparent 45%);` no border, no shadow. Keep the `::before` top accent hairline. The `::after` hover glow is not shown in rows (`display: none` under 600px).
- `.tile__icon`: `grid-area: icon; width: 40px; height: 40px; border-radius: 11px;` same hue fill and border as today.
- `.tile__name`: `grid-area: name; font-size: var(--nish-text-base); font-weight: var(--nish-weight-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;`
- `.status`: `grid-area: status; justify-self: start;` and `.status__label` is visually hidden (position absolute, 1px, clip, the usual sr-only rules), so rows show only the dot while screen readers still read the label.
- `.tile__blurb`: `grid-area: blurb; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: var(--nish-text-sm); line-height: 1.4; color: var(--nish-hi2);`
- `.tile__host` and `.tile__arrow`: `display: none`.
- `.tile__chevron`: `grid-area: chev; color: var(--nish-hi3); display: grid;` icon 18px.
- `.tile__badge` (soon): `grid-area: status; justify-self: start;`
- Tailnet badge in rows: `top: calc(1px + 14px + 11px); right: calc(16px + 18px + 8px); translate: 0 -50%;`, `.tile__tailnet-text` visually hidden (lock glyph only), padding so the badge is about 22x22, and `.tile__tailnet::after { content: ''; position: absolute; inset: -11px; }` so the hit area is 44x44. The tooltip still opens on tap (focus) and on hover.
- Hover (only `@media (hover: hover)`): `background-color: var(--nish-elevated)` on `.tile__link` for live tiles; no translate, no glow, no lift of the Tailnet badge. `:active` keeps `scale(0.995)`.
- Every 72px row and the whole row is the link, so the tap target is at least 72x328 at 360.

From 600px (`@media (min-width: 600px)`, the card layout):
- `.tiles`: `grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;` and the list-card styles are reset (`border: 0; background: none; box-shadow: none; border-radius: 0`). `.tile + .tile { border-top: 0 }`, corner-radius overrides reset to `var(--nish-radius-lg)` on every tile.
- `.tile:last-child:nth-child(odd) { grid-column: 1 / -1; }`
- `.tile__link`: `grid-template-columns: 42px minmax(0, 1fr) auto; grid-template-rows: auto auto 1fr auto; grid-template-areas: "icon badge arrow" "name name name" "blurb blurb blurb" "host host status"; column-gap: 8px; row-gap: 10px; min-height: 188px; padding: 18px 18px 16px; border: 1px solid var(--nish-line); border-radius: inherit; background: linear-gradient(180deg, color-mix(in oklab, var(--tile-hue) 7%, transparent), transparent 55%), var(--hub-surface); box-shadow: var(--nish-shadow-card);` (today's card look).
- `.tile__icon` 42px, radius 12px. `.tile__arrow`: `grid-area: arrow; display: block;` hidden until hover as today. `.tile__badge`: `grid-area: badge; justify-self: end;`. `.tile__name`: `font-size: var(--nish-text-lg); margin-top: 4px; white-space: normal;`. `.tile__blurb`: `align-self: start; display: block; -webkit-line-clamp: unset; font-size: var(--nish-text-sm); line-height: 1.45;`. `.tile__host`: `grid-area: host; display: block;` (ellipsis as today). `.status`: `grid-area: status; justify-self: end;` and `.status__label` visible again (undo the sr-only rules). `.tile__chevron`: `display: none`.
- `::after` glow and the hover lift, border tint and glow shadow exactly as today, only inside `@media (min-width: 600px) and (hover: hover)`.
- Tailnet badge: today's position (`top: calc(1px + 18px + 21px); right: calc(1px + 18px + 18px + 8px)`), `.tile__tailnet-text` visible, `::after { inset: -11px -4px; }` (44px tall hit area). Soon tiles: `right: calc(1px + 18px)` as today. Lift on hover as today.

From 1024px: `.tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); }`, `.tile:last-child:nth-child(odd) { grid-column: auto; }` then `.tile:last-child:nth-child(3n + 1) { grid-column: 1 / -1; }`.

Reach states at every width: unchanged (`soon` opacity 0.6 and dashed border on the card, `unreachable` opacity 0.55 and desaturated, `idle` hides `.status`). In the row layout a soon row has no dashed border (rows have no border); it is dimmed and shows the Soon badge.

Expected heights: at 360 each row is 72-80px, the list about 700px, so the whole page fits in about 1150px and about 7 apps show per screen. At 840: 2 columns, 5 rows (Nishboard spans both columns). At 1440: 3x3.

#### Section header (T2, `src/styles/layout.css`)
- `.section__head`: `align-items: center` (was baseline), keep the rest.
- `.section__action`: `min-height: var(--nish-tap-min); height: auto; padding: 0 12px; margin-right: -12px; font-size: var(--nish-text-sm); color: var(--nish-hi2);` `[aria-busy="true"]` gets `cursor: progress` and `opacity: 0.7`. Disabled state from `.nish-btn`.
- No shared visually-hidden utility: tiles.css carries its own sr-only rules on `.status__label` and `.tile__tailnet-text`.

#### Hero and footer (T3)
- `src/styles/header.css`, `@media (max-width: 599.98px)`: `.hero { padding: 28px 0 32px; gap: 16px; }`.
- `@media (max-width: 400px)`: `.pill { padding: 0 10px; gap: 6px; }`, `.hero__links { gap: 6px; }`. Keep `flex-wrap: wrap` as a safety net; at 360 all three pills fit (about 300px of 328).
- `src/styles/footer.css`, `@media (max-width: 599.98px)`: `.site-footer__links { display: none; }` (the hero already has the three links), `.site-footer { padding-top: 20px; }`.
- `src/render/footer.ts`: the year renders as `<span data-year>${new Date().getFullYear()}</span>` inside `.site-footer__copy`.
- `src/styles/base.css`: move `scroll-behavior: smooth` into `@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }`. The `rise` animation stays as is (it applies to `.tile` rows too).

#### Prerender and behavior (T1)
- `vite.config.ts` adds a plugin `hubPrerender()` (name `hub-prerender`, `transformIndexHtml` order `pre`) that imports `profile`, `links`, `tiles`, `tailnetNote` from `./src/config` and `renderHeader`, `renderTiles`, `renderFooter` from `./src/render/*`, and replaces the exact string `<div id="app"></div>` with:

  ```ts
  `<div id="app">${renderHeader(profile, links)}<main class="page">${renderTiles(tiles, tailnetNote)}</main>${renderFooter(profile, links)}</div>`
  ```
  It throws `index.html is missing <div id="app"></div>` if the string is absent. Plugins order: `[nishThemeInit(), hubPrerender()]`.
- `src/main.ts`: render client-side only when `app.childElementCount === 0` (fallback); otherwise leave the DOM alone. After that, unchanged wiring (theme, tooltips, click handler), plus:
  - `app.querySelectorAll('[data-year]')` text set to `String(new Date().getFullYear())`.
  - Recheck: see T1 for the exact code.
- `src/probe.ts`: `probeAll` returns `Promise<void>` that resolves when every tile's result is in (`Promise.all` over the per-tile promises). Behavior per tile unchanged.

#### Head (T4)
Final `<head>` of `index.html` (body unchanged, including the exact `<div id="app"></div>`):

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<!-- Theme before first paint: @nish/ui theme-init.js, inlined by vite.config.ts. It also creates the one theme-color meta. -->
<!-- nish-theme-init -->
<title>Nish</title>
<meta name="description" content="Nish's software hub: apps and resume." />
<meta name="color-scheme" content="dark light" />
<meta property="og:title" content="Nish" />
<meta property="og:description" content="Software hub: apps and resume." />
<meta property="og:url" content="https://nish.software/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="nish.software" />
<meta property="og:image" content="https://nish.software/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Nish: software hub" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

`public/site.webmanifest`:
```json
{
  "name": "Nish",
  "short_name": "Nish",
  "description": "Software hub: apps and resume.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#0a0b0f",
  "theme_color": "#0a0b0f",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Images (all from `public/favicon.svg`'s artwork, generated by `scripts/make-icons.mjs`):
- `public/apple-touch-icon.png` 180x180: full-bleed `#0a0b0f` square (no transparency, no rounded corners; iOS rounds it) with the "N" path at 62% of the size, centered.
- `public/icon-192.png`, `public/icon-512.png`: the favicon as is (rounded square on transparent), scaled.
- `public/icon-maskable-512.png`: full-bleed `#0a0b0f`, "N" at 50% of the size, centered (inside the 80% safe zone).
- `public/og-image.png` 1200x630: background `#0a0b0f` with the hub's glows (radial indigo at 15% 0% and emerald at 90% 10%, same as `base.css` dark), the favicon at 120px top-left at (96, 96), then "Nish" in Inter 700 at 120px, letter-spacing -0.04em, color `#f2f3f7`, then "Software hub" at 44px Inter 600 in `#a9adbd`, then `nish.software` in a monospace font at 28px in `#7c8194`, all left-aligned at x=96. Use Inter from `node_modules/@nish/ui/dist/fonts/inter-latin-wght-normal.*.woff2` via `@font-face` with a `file://` URL.

### Security
Not affected: static public site, no new routes, no secrets, no user input. The manifest and images are public static files. Prerendering only moves existing trusted config strings (still escaped by `esc`) into the HTML at build time.

### Performance
- First paint shows the full page (prerendered HTML, render-blocking CSS link in `<head>`) instead of an empty background; `main.ts` no longer rebuilds the DOM.
- `dist/index.html` grows to about 15-20 kB (about 4-5 kB gzip). JS bundle size about the same (render functions stay for the fallback).
- PNGs: apple-touch-icon under 15 kB, icon-512 under 40 kB, og-image under 150 kB (it is only fetched by link-preview crawlers).
- Recheck runs at most one probe round at a time (ignored while running).

### Mobile, light and dark
Stated per element above. All colors are `--nish-*` roles, so light and dark follow the theme; the row list's opaque `--nish-surface` is `#111218` dark and `#ffffff` light. Targets: rows 72px+, pills 44px, Recheck 44px, Tailnet hit area 44x44 (rows) or 44px tall (cards), footer links 44px (shown from 600px).

### Ops
None: no env vars, ports or hosting changes. Push to `master` deploys as today; `scripts/deploy.ps1` already runs `vite build`, which now prerenders.

## Tasks

All tasks work in `C:\Code\nish.software-ux-overhaul` (dependencies already installed). Do not commit; the integrate step commits.

### T1 Prerender, main wiring, recheck, README
- Repo / checkout: nish.software at `C:\Code\nish.software-ux-overhaul`
- Owns: `vite.config.ts`, `src/main.ts`, `src/probe.ts`, `README.md`
- Reads (does not edit): `src/render/*.ts`, `src/config.ts`, `src/types.ts`, `index.html`
- Depends on: none (uses the contracts in Design: `renderTiles(tiles, tailnetNote)` signature unchanged, the `[data-action="recheck"]` button and `[data-year]` span rendered by T2 and T3)
- Change:
  1. `vite.config.ts`: add `hubPrerender()` as described in Design → Prerender. Import with relative paths (`./src/config`, `./src/render/header`, `./src/render/tiles`, `./src/render/footer`). Add a doc comment: "Renders the page from src/config.ts at build time (and in dev), so the first paint is the page; src/main.ts only wires behavior. Vite restarts the dev server when these imports change." Register it after `nishThemeInit()`.
  2. `src/probe.ts`: change `probeAll` to

     ```ts
     export const probeAll = async (tiles: Tile[], onResult: (tile: Tile, state: ReachState) => void): Promise<void> => {
       const tailnetAllowed = canProbeTailnet();
       await Promise.all(
         tiles
           .filter((tile) => tile.probe && !tile.soon)
           .map(async (tile) => {
             if (tile.tailnetOnly && !(await tailnetAllowed)) {
               onResult(tile, 'idle');
               return;
             }
             onResult(tile, 'probing');
             onResult(tile, await probe(tile.href));
           }),
       );
     };
     ```
     Keep the existing comments.
  3. `src/main.ts`:
     - Replace the unconditional `app.innerHTML = …` with the same template inside `if (app.childElementCount === 0) { … }` and a comment: "vite.config.ts prerenders this markup into index.html; render here only if that did not happen."
     - After the tooltips line: `for (const el of app.querySelectorAll<HTMLElement>('[data-year]')) el.textContent = String(new Date().getFullYear());`
     - Replace the last line with:

       ```ts
       const recheck = app.querySelector<HTMLButtonElement>('[data-action="recheck"]');
       let checking = false;
       const runProbes = async (): Promise<void> => {
         if (checking) return;
         checking = true;
         if (recheck) {
           recheck.disabled = true;
           recheck.setAttribute('aria-busy', 'true');
           recheck.textContent = 'Checking…';
         }
         try {
           await probeAll(tiles, (tile, state) => setTileState(app, tile, state));
         } finally {
           checking = false;
           if (recheck) {
             recheck.disabled = false;
             recheck.removeAttribute('aria-busy');
             recheck.textContent = 'Recheck';
           }
         }
       };
       recheck?.addEventListener('click', () => void runProbes());
       void runProbes();
       ```
  4. `README.md`: in the table, `vite.config.ts` row adds "and prerenders the header, tiles and footer from `src/config.ts` into `#app` (`hubPrerender`), so the first paint is the full page"; `src/render/*.ts` row becomes "Header, tiles, footer as HTML strings. Rendered at build time by `vite.config.ts`; `main.ts` only wires behavior."; `src/probe.ts` row adds "The Recheck button in the Apps header runs it again." Add a row `scripts/make-icons.mjs` | "Regenerates `public/apple-touch-icon.png`, the manifest icons and `og-image.png` from the favicon artwork (one-off, uses Playwright from `C:\Code\ui\node_modules`): `node scripts/make-icons.mjs`." and a row `public/site.webmanifest` | "Web app manifest (name, colors, icons) so the hub installs to a home screen with its icon."
- Edge cases:
  - `#app` already has children (normal case): no innerHTML write; the click handler, tooltips and theme toggle work on the prerendered DOM.
  - No Recheck button in the DOM (no probe-able tiles): `runProbes` still runs once, nothing to update.
  - Recheck clicked while running: ignored (button is disabled anyway).
  - A probe throws: `probe` already catches; `finally` restores the button regardless.
- Acceptance (run in the checkout):
  - `npm run typecheck && npm run build` pass.
  - `grep -c 'class="tiles"' dist/index.html` prints 1, and `grep -c 'class="site-footer"' dist/index.html` prints 1 (after T2 and T3 also landed, `grep -c 'data-action="recheck"' dist/index.html` prints 1).
  - `npx vite preview --port 4173 --strictPort` then load http://localhost:4173/ with JS disabled (or `curl -s http://localhost:4173/ | grep -c tile__name` prints 9): the tiles are in the HTML.

### T2 Tile list and cards, section header
- Repo / checkout: nish.software at `C:\Code\nish.software-ux-overhaul`
- Owns: `src/render/tiles.ts`, `src/styles/tiles.css`, `src/styles/layout.css`, `src/icons.ts`, `src/types.ts`
- Reads (does not edit): `src/config.ts`, `src/util.ts`, `src/styles/base.css`, `node_modules/@nish/ui/dist/nish-components.css`
- Depends on: none
- Change:
  1. `src/types.ts`: add `| 'chevron'` to `IconName`.
  2. `src/icons.ts`: add `chevron: '<path d="m9 6 6 6-6 6"/>'`.
  3. `src/render/tiles.ts`:
     - `STATUS_LABEL` per Design (`ok: 'Reachable'`, `soon: ''`).
     - `renderTiles`: sort a copy so soon tiles come last (`[...tiles].sort((a, b) => Number(!!a.soon) - Number(!!b.soon))`; `Array.prototype.sort` is stable), pass the sorted index as `i`. Render the section head with the Recheck button per Design when `tiles.some((t) => t.probe && !t.soon)`.
     - `renderTile`: flat markup per Design → Tile markup. Soon tiles: badge `<span class="nish-badge tile__badge">Soon</span>`, no arrow, status or chevron. Tailnet badge text span gets `class="tile__tailnet-text"`.
     - `setTileState`: unchanged logic; it must tolerate a tile with no `.status__dot` / `.status__label` (it already does).
  4. `src/styles/tiles.css`: rewrite the layout per Design → Tile layout per width. Keep the accent mapping block, the reach-state rules (scope hover-only overrides as described), the Tailnet z-index rules (`.tile:hover, .tile:focus-within { z-index: 2; }`). Remove the now-unused `.tile__top` and `.tile__foot` rules. Use `@media (min-width: 600px)` and `@media (min-width: 1024px)`; the base rules are the row layout. The sr-only rules (used for `.status__label` in rows and `.tile__tailnet-text` in rows):

     ```css
     position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
     overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
     ```
     and the undo from 600px: `position: static; width: auto; height: auto; margin: 0; overflow: visible; clip: auto;`.
  5. `src/styles/layout.css`: `.section__head` `align-items: center`; add `.section__action` per Design → Section header.
- Edge cases:
  - Long tile name at 360: truncates with an ellipsis in the name column; the dot stays visible after it.
  - Blurb longer than 2 lines at 360: clamped with an ellipsis; full text from 600px.
  - Status `idle` (tailnet tile without permission): no dot (existing `[data-reach='idle'] .status { display: none }`).
  - Unreachable tile: row or card dimmed and desaturated; tapping still shows the toast (main.ts click handler uses `a[data-tile-link]` inside `.tile[data-reach="unreachable"]`, unchanged).
  - Tooltip on the last row at 360: `.tiles` has no overflow clipping, so the tooltip shows below the list.
  - Focus ring: the `:focus-visible` outline from base.css is drawn outside the link and `.tiles` does not clip, so it shows on rows. Check it at 360.
  - Odd tile counts other than 9: the last-child spanning rules handle any count.
- Acceptance:
  - `npm run typecheck && npm run build` pass.
  - With `npx vite preview --port 4173 --strictPort` running (after `npm run build`): from `C:\Code\ui`, `node tools/visual-check.mjs C:/Code/nish.software-ux-overhaul/tools/hub.visual.json --out C:/Users/nish5/AppData/Local/Temp/hub-visual` passes (no horizontal overflow, no tap-target violations). Look at `phone-small-dark.jpg`, `phone-small-light.jpg`, `fold-*.jpg`, `desktop-*.jpg`: rows at 360 (about 7 apps in the first 740px below the hero), 2 columns at 840 with Nishboard spanning both, 3x3 at 1440.
  - At 360 in a browser: every `.tile__link` is at least 72px tall; the Tailnet badge's hit area (`::after`) is 44px tall; `.tile__host` is not displayed.

### T3 Hero, footer and base
- Repo / checkout: nish.software at `C:\Code\nish.software-ux-overhaul`
- Owns: `src/styles/header.css`, `src/styles/footer.css`, `src/styles/base.css`, `src/render/footer.ts`
- Reads (does not edit): `src/render/header.ts`, `src/config.ts`
- Depends on: none
- Change: exactly the items in Design → Hero and footer.
- Edge cases:
  - 320px viewport (narrower than the target): pills may wrap to two rows (allowed by `flex-wrap: wrap`); no horizontal scroll.
  - 600px and up: footer links show again as today, 44px tall.
  - Reduced motion: no smooth scrolling for the skip link; rise animation delay already 0.
- Acceptance:
  - `npm run typecheck && npm run build` pass.
  - At 360 (light and dark) in a browser on `npm run preview`: the three `.hero__links li` have the same `offsetTop`; `.site-footer__links` is `display: none`; the footer shows "© <year> Nishant Arora". At 840 and 1440 the footer links show.
  - `grep -c 'data-year' dist/index.html` prints 1 (needs T1's prerender; before T1 lands, check `src/render/footer.ts` contains `data-year`).

### T4 Head metadata, manifest and icons
- Repo / checkout: nish.software at `C:\Code\nish.software-ux-overhaul`
- Owns: `index.html`, `public/site.webmanifest` (new), `public/apple-touch-icon.png` (new), `public/icon-192.png` (new), `public/icon-512.png` (new), `public/icon-maskable-512.png` (new), `public/og-image.png` (new), `scripts/make-icons.mjs` (new)
- Reads (does not edit): `public/favicon.svg`, `src/styles/base.css`, `node_modules/@nish/ui/dist/fonts/`
- Depends on: none
- Change:
  1. `index.html`: the `<head>` exactly as in Design → Head (the static theme-color meta removed). Do not change `<body>`; `<div id="app"></div>` must stay byte-for-byte (T1's prerender replaces it).
  2. `public/site.webmanifest`: exactly as in Design → Head.
  3. `scripts/make-icons.mjs` (ESM, Node 20+): header comment "One-off: regenerates the PNG icons and og:image in public/ from the favicon artwork. Run from the repo root: node scripts/make-icons.mjs. Uses Playwright from C:\Code\ui\node_modules (not a dependency of this repo)." Import Playwright with `const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'file:///C:/Code/ui/node_modules/playwright/index.mjs');` (a bare `C:/...` path fails on Windows with ERR_UNSUPPORTED_ESM_URL_SCHEME). Read `public/favicon.svg` and the Inter woff2 (glob `node_modules/@nish/ui/dist/fonts/inter-latin-wght-normal.*.woff2` with `readdirSync`), build an HTML string per image, `page.setViewportSize({ width, height })`, `page.setContent(html)`, wait for `document.fonts.ready`, and `page.screenshot({ path, omitBackground })` (`omitBackground: true` only for icon-192 and icon-512, which keep the favicon's transparent corners). Sizes and content per Design → Head. Write all five PNGs into `public/`.
  4. Run `node scripts/make-icons.mjs` and check the PNGs by opening them (Read tool on the image): correct sizes, the "N" centered, og-image text not clipped.
- Edge cases:
  - Playwright missing at that path: the script exits with a clear message "Playwright not found; set PLAYWRIGHT_MODULE to its index.mjs file URL" and code 1.
  - Light mode: theme-init now creates the only theme-color meta, so `document.querySelectorAll('meta[name=theme-color]').length === 1` and its content is `#f7f6f3` in light, `#0a0b0f` in dark.
- Acceptance:
  - `npm run typecheck && npm run build` pass; `dist/` contains `site.webmanifest`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og-image.png`.
  - `grep -c 'name="theme-color"' index.html` prints 0.
  - `node -e "const b=require('fs').readFileSync('public/og-image.png');console.log(b.readUInt32BE(16),b.readUInt32BE(20))"` prints `1200 630`; the same for `public/apple-touch-icon.png` prints `180 180`.
  - On `npm run preview`, `curl -sI http://localhost:4173/site.webmanifest` and `/apple-touch-icon.png` return 200.

## Waves

W1: T1, T2, T3, T4 (owned files are disjoint; the contracts between them are written above). Integrate after W1: `npm run typecheck && npm run build`, then the T1 grep checks on `dist/index.html`.

## Review focus

- 360 (light and dark): the list card, rows at 72px+, the dot inline with the name, the clamped blurbs, the lock glyph's tooltip opening on tap and not being clipped, no horizontal scroll, about 7 apps per screen.
- 840: 2 columns, no truncated host on the Nishboard card, Nishboard spanning the row. 1440: 3x3.
- The prerendered `dist/index.html`: full markup in `#app`, the click handler, tooltips, theme toggle and probes still work, and no double render (main.ts must not rewrite `#app`).
- Head: exactly one theme-color meta in both themes; manifest valid (Chrome DevTools Application tab or a manual JSON read); og-image looks right.
- Recheck: dots pulse during a check, the button reads "Checking…", disabled, and returns to "Recheck".
- Focus rings on rows and the Recheck button; screen reader text for the row status ("Reachable") and the lock ("Tailnet" plus the tooltip).

## Release

Single repo. PR `ux-overhaul` → `master`, merge commit, which runs `deploy.yml` (check on GitHub, deploy on the self-hosted runner). Verify live: https://nish.software returns 200; `curl -s https://nish.software/ | grep -c tile__name` prints 9 (prerendered); https://nish.software/site.webmanifest, /apple-touch-icon.png and /og-image.png return 200; screenshots at 360x780, 840x900 and 1440x900 in light and dark (the visual-check config `tools/hub.visual.json` with its page URL pointed at https://nish.software/, or the audit's `shots.mjs`).

## Deferred to the v0.7.0 adoption pass

The hub is a static page (no React), so most v0.7.0 React components do not apply. For the next pass, after `@nish/ui` is bumped to v0.7.0:

- **App header → AppHeader**: not applicable as React. v0.7.0 ships no static AppHeader; the hub's topbar (wordmark + theme pill) is not sticky and stays local. Re-check only if a static header class lands later.
- **Phone bottom tab bar / More sheet → BottomNav, MoreSheet, NavRail** (static twin `.nish-bottom-nav`): not applicable; the hub is one page with no sections to switch between.
- **Toaster offset**: the hub uses the static `showToast` (`.nish-toast`). v0.7.0 changes `.nish-toast`'s bottom to `max(calc(var(--nish-bottom-inset, 0px) + 8px), calc(16px + env(safe-area-inset-bottom)))`; no local change, just verify the unreachable-tile toast at 360 after the bump.
- **Local tables → ResponsiveTable**: none on the hub.
- **Local format helpers → `@nish/ui/format`**: the hub has `hostOf` (`src/util.ts`) and the footer year; `@nish/ui/format` has no host or year helper, so keep them. Reconsider only if the pass adds a "checked N ago" line to the Recheck control (`ago()`).
- **CommandPalette**: not needed for nine tiles; skip unless the tile count grows past about 15.
- **LineChart / BarChart**: none on the hub.
- **Tiles → `.nish-link-card` / `.nish-link-card--row`** (static twin of LinkCard, row layout under 600px): consider moving the tile CSS onto it once it covers the status dot, the Tailnet badge with tooltip, and the soon state; until then the local tiles.css from this overhaul stays.
- **Recheck busy state → `.nish-btn[aria-busy="true"]`** (v0.7.0 spinner on busy static buttons): drop the "Checking…" text swap for the built-in spinner if it reads well.
- **Head**: v0.7.0's README recommends `interactive-widget=resizes-content` in the viewport meta and no static theme-color meta (already removed here); add the viewport flag if the hub ever gets an input.

## Open questions for the research phase

None. Every design choice is made above.
