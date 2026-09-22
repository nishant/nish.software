# nish.software

The front door: tiles to my self-hosted apps, the projects behind them, and my resume.
Static site, Vite + TypeScript, no runtime dependencies, dark by default with a light mode.

| Path | What |
|---|---|
| `src/config.ts` | **Everything on the page.** Tiles, links, tagline. Edit this to change content. |
| `src/types.ts` | The shapes `config.ts` must follow. |
| `src/probe.ts` | On load, pings each tile's URL (`fetch` in `no-cors` mode) and dims the ones that do not answer from where the visitor is. Tailnet-only apps are also flagged in config, so they always carry a lock badge. |
| `src/theme.ts` | Dark for everyone unless the visitor toggled light here (saved in localStorage). The inline script in `index.html` applies it before first paint. |
| `src/render/*.ts` | Header, tiles, footer as HTML strings. |
| `src/styles/*.css` | `tokens.css` holds both themes and the accent hues; the rest is one file per component. |
| `public/resume.pdf` | The resume the Resume button opens (`profile.resumeUrl` in config). |
| `scripts/deploy.ps1` | Run by the self-hosted runner on push to `main`: pull into `C:\Apps\nish.software`, `npm ci`, build `dist/`. |
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
  accent: 'rose',          // emerald | indigo | amber | lime | rose | sky
  tailnetOnly: false,      // true = lock badge + "only reachable on my tailnet"
  probe: true,             // ping on load and grey out if it does not answer
  // soon: true,           // not live yet: muted "Coming soon" tile, not a link (set probe: false)
}
```

Then add the site to nishant/hosting (`sites.yaml` + Caddyfile) so the host exists.

## Deploy

Push to `main`. The workflow typechecks and builds on GitHub, then the runner on the
hosting PC runs `scripts\deploy.ps1`, and Caddy serves `C:\Apps\nish.software\dist`.
First-time setup is in [docs/HOSTING.md](docs/HOSTING.md).
