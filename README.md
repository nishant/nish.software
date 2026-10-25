# nish.software

The front door: tiles to my self-hosted apps, the projects behind them, and my resume.
Static site, Vite + TypeScript, no framework. Colors, font and theme switching come from
the shared [`@nish/ui`](https://github.com/nishant/ui) package (plain CSS and a tiny theme
module, no React here), so the hub matches every other `*.nish.software` app: system,
light or dark, one choice shared across subdomains.

| Path | What |
|---|---|
| `src/config.ts` | **Everything on the page.** Tiles, links, tagline. Edit this to change content. |
| `src/types.ts` | The shapes `config.ts` must follow. |
| `src/probe.ts` | On load, pings each tile's URL (`fetch` in `no-cors` mode) and dims the ones that do not answer from where the visitor is. Tailnet-only apps carry a lock badge and are pinged only when the browser allows it without a prompt (Chrome gates 100.x addresses behind a "local network access" permission); otherwise they show no dot and simply open on click. |
| `src/theme.ts` | Mounts the header toggle (system → light → dark) with `@nish/ui/theme`'s `mountThemeToggle`, and adds the word next to its icon. The choice is saved in the shared `nish-theme` cookie on `.nish.software` and in localStorage. Also moves a choice saved under the hub's old `theme` key over once. |
| `vite.config.ts` | Inlines `@nish/ui`'s `theme-init.js` into `index.html` at the `<!-- nish-theme-init -->` marker, so the theme is applied before first paint with no extra request. The hub only offers dark and light (`data-nish-themes="dark light"`); a preset picked elsewhere shows as its light or dark base. |
| `src/render/*.ts` | Header, tiles, footer as HTML strings. |
| `src/styles/*.css` | One file per part of the page, on the `--nish-*` roles from `@nish/ui/nish.css` used directly (never hex values) plus the static component classes from `@nish/ui/nish-components.css` (`nish-btn`, `nish-badge`, `nish-dot`, `nish-theme-btn`). The few hub-only values (`--hub-surface`, the glow and grain alphas) sit at the top of `base.css`; `tiles.css` maps each tile's `data-accent` to `--tile-hue` / `--tile-hue-soft`. |
| `public/resume.pdf` | The resume the Resume button opens (`profile.resumeUrl` in config). |
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

Append to `tiles` in `src/config.ts`:

```ts
{
  id: 'recipes',
  name: 'Recipes',
  blurb: 'One sentence about it.',
  href: 'https://recipes.nish.software',
  icon: 'startpage',       // add a new one in src/icons.ts if none fits
  accent: 'rose',          // emerald | indigo | amber | lime | rose | sky | violet | teal
  tailnetOnly: false,      // true = lock badge + "only reachable on my tailnet"
  probe: true,             // ping on load and grey out if it does not answer
  // soon: true,           // not live yet: muted "Coming soon" tile, not a link (set probe: false)
}
```

Then add the site to nishant/hosting (`sites.yaml` + Caddyfile) so the host exists.

## Deploy

Push to `master`. The workflow typechecks and builds on GitHub, then the runner on the
hosting PC runs `scripts\deploy.ps1`, and Caddy serves `C:\Apps\nish.software\dist`.
First-time setup is in [docs/HOSTING.md](docs/HOSTING.md).
