# Roadmap

## Ideas

- ~~**UX overhaul from the 2026-10-28 audit** (2026-10-28): A compact app list on the phone cover screen, a 3-column desktop grid, a prerendered page with no blank first paint, head metadata (manifest, icons, og:image, one theme-color) and a Recheck control for app reachability.~~ Done 2026-10-28 (spec: `git show 58069c61:docs/specs/ux-overhaul.md`).
- ~~**Adopt @nish/ui v0.7.0** (2026-10-28): the shared components listed under "Deferred to the v0.7.0 adoption pass" in that spec.~~ Done 2026-10-28 (spec: `git show 1a14fe5e:docs/specs/ux-adopt.md`).
- **Hub dots from status.nish.software** (2026-10-30): Tile dots come from one fetch of `status.nish.software/api/public`, mapped by host: Healthy, Degraded or Down, with a tooltip giving 24 h uptime and when it was checked. Tailnet tiles get dots too. The `no-cors` probe stays only as the fallback when status does not answer (status must send `Access-Control-Allow-Origin: https://nish.software` on `/api/public`).
