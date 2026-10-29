# CLAUDE.md

Read `README.md` first. Hosting conventions live in `nishant/hosting` (`CLAUDE.md`,
`docs/OPERATIONS.md`); they win if this file disagrees. A push to `master` deploys.

- Target device: Samsung Galaxy Z Fold 7 (cover screen ~360-390 CSS px, unfolded a near-square
  ~840px). The hub must look right, with no horizontal page scroll, at 360px (not just 375/390),
  ~840px and desktop, in light and dark, with 44px touch targets. Check in a browser at those
  widths before calling UI work done.
- Every page must be reachable on the phone through a visible UI element (bottom bar, More
  sheet, menu, or a link on another page), never only by typing its URL: no desktop-only nav
  entries, and no page that tells a phone user to open it on a desktop.

## Autonomy

Nish's rule (2026-10-26): Claude sessions build, commit, push, open and merge PRs, release
and deploy on their own judgment, without asking Nish. Work is done only when it is merged,
deployed (push to `master` runs `deploy.yml`) and confirmed live at https://nish.software.
Pick sensible defaults instead of asking; stop for Nish only when it is critically necessary:
credentials or account signups, or anything destructive to production data. The hard rules
in `nishant/hosting`'s `CLAUDE.md` (Cloudflare dashboard, firewall, deleting tasks or folders,
`tailscale serve`) still apply.
