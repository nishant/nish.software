# Hosting nish.software

How this site and the startpage fit the conventions in
[nishant/hosting](https://github.com/nishant/hosting) (read its `CLAUDE.md` and
`docs/OPERATIONS.md` first), and the one-time steps on the PC.

## What serves what

| Host | Where it comes from | How |
|---|---|---|
| `nish.software` | this repo, `C:\Apps\nish.software\dist` | Caddy `file_server` on `127.0.0.1:8080`, via the Cloudflare tunnel |
| `www.nish.software` | Caddy | permanent redirect to `https://nish.software` |
| `start.nish.software` | `nishant/nishant.github.io`, `C:\Apps\startpage` | Node on `127.0.0.1:8800` (task `Startpage`), Caddy `reverse_proxy` |

Both repos deploy themselves on push, the job-apps way: a `check` job on GitHub, then a
`deploy` job on a self-hosted runner on the PC that runs the repo's `scripts\deploy.ps1`
against the live checkout under `C:\Apps`. The hosting repo only maps hostnames to folders
and ports (`sites.yaml`, `Caddyfile`).

## One-time setup on the PC

Elevated PowerShell, in this order. Steps 1 and 2 install a runner per repo, exactly like
`docs/SETUP.md` step 2 in the hosting repo with the names changed.

### 1. Runner for nish.software

```powershell
mkdir C:\actions-runner-nish-software; cd C:\actions-runner-nish-software
$ver = (gh api repos/actions/runner/releases/latest --jq .tag_name).TrimStart('v')
Invoke-WebRequest "https://github.com/actions/runner/releases/download/v$ver/actions-runner-win-x64-$ver.zip" -OutFile runner.zip
Expand-Archive runner.zip -DestinationPath .; Remove-Item runner.zip
$reg = gh api -X POST repos/nishant/nish.software/actions/runners/registration-token --jq .token
.\config.cmd --url https://github.com/nishant/nish.software --token $reg --unattended `
  --name nish-pc-nish-software --labels nish-software --runasservice --windowslogonaccount "NT AUTHORITY\SYSTEM"
```

### 2. Runner for the startpage

```powershell
mkdir C:\actions-runner-startpage; cd C:\actions-runner-startpage
$ver = (gh api repos/actions/runner/releases/latest --jq .tag_name).TrimStart('v')
Invoke-WebRequest "https://github.com/actions/runner/releases/download/v$ver/actions-runner-win-x64-$ver.zip" -OutFile runner.zip
Expand-Archive runner.zip -DestinationPath .; Remove-Item runner.zip
$reg = gh api -X POST repos/nishant/nishant.github.io/actions/runners/registration-token --jq .token
.\config.cmd --url https://github.com/nishant/nishant.github.io --token $reg --unattended `
  --name nish-pc-startpage --labels startpage --runasservice --windowslogonaccount "NT AUTHORITY\SYSTEM"
Get-Service actions.runner.*    # expect four: hosting, job-apps, nish-software, startpage
```

### 3. First deploys

Merge/push `main` in nish.software and `master` in nishant.github.io (or run each repo's
`deploy` workflow by hand: `gh workflow run deploy --repo nishant/nish.software`,
`gh workflow run deploy --repo nishant/nishant.github.io`). The first startpage deploy
warns that `server\.env` is missing and health-checks fine; weather answers 503 until step 4.

### 4. Startpage secrets and task

```powershell
Copy-Item C:\Apps\startpage\server\.env.example C:\Apps\startpage\server\.env
notepad C:\Apps\startpage\server\.env     # paste OPENWEATHERMAP_API_KEY=...
C:\Apps\startpage\scripts\tasks.ps1 restart
C:\Apps\startpage\scripts\tasks.ps1 status
curl.exe -s http://127.0.0.1:8800/health   # "weatherConfigured":true
```

The deploy registers the `Startpage` task on first start (`tasks.ps1 start` does it when the
task is missing) from `scripts\Startpage.task.xml`.

### 5. Hosting repo

Push the hosting commit that adds the three Caddy blocks and `sites.yaml` entries. Then
`powershell -NoProfile -ExecutionPolicy Bypass -File C:\Code\hosting\scripts\status.ps1`
should list `nish.software`, `www.nish.software` and `start.nish.software` as OK.

### 6. Cloudflare (dashboard, by hand)

- Tunnel `jobapps`: add public hostname routes for `nish.software` and `www.nish.software`
  to `http://127.0.0.1:8080`. The existing wildcard `*.nish.software` route already covers
  `start.nish.software`, but the apex and `www` are not matched by a wildcard.

### 7. Google sign-in on the startpage

Google Cloud Console, the OAuth web client used by the startpage (client id in
`src/main.ts` of nishant.github.io): add `https://start.nish.software` under Authorized
JavaScript origins. Until then the "Sign in with Google" button on the new host fails with
an origin error; everything else on the page works.

### 8. Resume

Replace `public/resume.pdf` in this repo with the real one and push.

## Checks

```powershell
curl.exe -s -H "Host: nish.software" http://127.0.0.1:8080 | Select-String "<title>"
curl.exe -s -H "Host: start.nish.software" http://127.0.0.1:8080/health
gh run list --repo nishant/nish.software --limit 3
gh run list --repo nishant/nishant.github.io --limit 3
```

From a phone off the tailnet, https://nish.software should show the Trading tile greyed
with "Tailnet only", and the other three tiles online.
