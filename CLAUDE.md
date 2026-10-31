# CLAUDE.md

Read `README.md` first. Hosting conventions live in `nishant/hosting` (`CLAUDE.md`,
`docs/OPERATIONS.md`); they win if this file disagrees. A push to `master` deploys.

- UI follows "Phones and layout" in [`global/CLAUDE.md`](https://github.com/nishant/skills/blob/master/global/CLAUDE.md) in `nishant/skills`: 360px, ~840px and desktop, light and dark, 44px targets, no horizontal page scroll, and every page reachable through visible UI.

## Autonomy

Nish's standing rule: build, merge, release and deploy without asking; stop only for credentials, account signups, anything destructive to production data, and hosting's hard rules. The canonical text is "Autonomy" in [`global/CLAUDE.md`](https://github.com/nishant/skills/blob/master/global/CLAUDE.md) in `nishant/skills`. Done here means merged, `deploy.yml` green and https://nish.software serving it.

