# nish.software

The front door: tiles to my self-hosted apps, the projects behind them, and my resume.
Static site, Vite + TypeScript, no framework. Colors, font and theme switching come from
the shared [`@nish/ui`](https://github.com/nishant/ui) package (plain CSS and a tiny theme
module, no React here), so the hub matches every other `*.nish.software` app: system,
light or dark, one choice shared across subdomains.

| Path | What |
|---|---|
| `src/config.ts` | Profile, links and the tailnet note. The tiles come from `src/tiles.generated.ts`. |
| `src/tiles.generated.ts` | Generated from hosting's `sites.yaml`; do not edit. See "Add a tile". |
| `src/types.ts` | The shapes `config.ts` must follow. |
| `src/probe.ts` | The fallback when status does not answer: pings each tile's URL (`fetch` in `no-cors` mode) and dims the ones that do not answer from where the visitor is. `probeAll` first asks `src/status.ts`; a tile status covers takes its dot from there, and only the rest are pinged. Tailnet-only apps carry a lock badge and are pinged only when the browser allows it without a prompt (Chrome gates 100.x addresses behind a "local network access" permission); otherwise they show no dot and simply open on click. The Recheck button in the Apps header runs it again (it shows a spinner while it runs). |
| `src/status.ts` | One CORS request to `status.nish.software/api/public?bars=0` (status allows only the `https://nish.software` origin; 3 s timeout, no credentials) mapping each host to Healthy, Degraded or Down plus its 24 h uptime, shown in a tooltip on cards. The JSON is untrusted and type-checked; stale data or any failure counts as "status did not answer". |
| `src/theme.ts` | Mounts the header toggle (system → light → dark) with `@nish/ui/theme`'s `mountThemeToggle`, and adds the word next to its icon. The choice is saved in the shared `nish-theme` cookie on `.nish.software` and in localStorage. Also moves a choice saved under the hub's old `theme` key over once. |
| `vite.config.ts` | Inlines `@nish/ui`'s `theme-init.js` into `index.html` at the `<!-- nish-theme-init -->` marker, so the theme is applied before first paint with no extra request. The hub only offers dark and light (`data-nish-themes="dark light"`); a preset picked elsewhere shows as its light or dark base. It also prerenders the header, tiles and footer from `src/config.ts` into `#app` (`hubPrerender`), so the first paint is the full page. |
| `src/render/*.ts` | Header, tiles, footer as HTML strings. Rendered at build time by `vite.config.ts`; `main.ts` only wires behavior. |
| `src/styles/*.css` | One file per part of the page, on the `--nish-*` roles from `@nish/ui/nish.css` used directly (never hex values) plus the static component classes from `@nish/ui/nish-components.css` (`nish-btn`, `nish-badge`, `nish-dot`, `nish-theme-btn`, `nish-tooltip` on the Tailnet badges, `nish-link-card` on the tiles, and the busy `nish-btn[aria-busy]` spinner on Recheck). The few hub-only values (`--hub-surface`, the glow and grain alphas) sit at the top of `base.css`; `tiles.css` maps each tile's `data-accent` to `--tile-hue`, which it passes to the link card as `--nish-card-accent`. |
| `public/resume.pdf` | The resume the Resume button opens (`profile.resumeUrl` in config). |
| `public/site.webmanifest` | Web app manifest (name, colors, icons) so the hub installs to a home screen with its icon. |
| `scripts/make-icons.mjs` | Regenerates `public/apple-touch-icon.png`, the manifest icons and `og-image.png` from the favicon artwork (one-off, uses Playwright from `C:\Code\ui\node_modules`): `node scripts/make-icons.mjs`. |
| `scripts/deploy.ps1` | Run by the self-hosted runner on push to `master`: pull into `C:\Apps\nish.software`, `npm ci`, build `dist/`. |
| `docs/HOSTING.md` | How this fits nishant/hosting, and the one-time setup steps on the PC. |

## Develop

```bash
npm ci
npm run dev        # http://localhost:5173
npm run typecheck
npm run build      # dist/
npm run preview    # serves dist/ on http://localhost:4173
```

## Add a tile

Tiles are generated from nishant/hosting. Add the tile fields to the site in hosting's `sites.yaml`
(`tile` is the id; then `order`, `name`, `blurb`, `icon`, `accent`, and `soon: yes` for a
not-live-yet tile), then run in hosting:

```
node scripts/catalog.mjs --hub C:Code
ish.software
```

and commit the regenerated `src/tiles.generated.ts` here. Do not edit that file by hand.
`icon` must exist in `src/icons.ts` (add one if none fits) and `accent` is one of
emerald | indigo | amber | lime | rose | sky | violet | teal; the type check fails otherwise.

## Deploy

Push to `master`. The workflow typechecks and builds on GitHub, then the runner on the
hosting PC runs `scripts\deploy.ps1`, and Caddy serves `C:\Apps\nish.software\dist`.
First-time setup is in [docs/HOSTING.md](docs/HOSTING.md).
